---
layout: default
title: "LAB2 : A New World"
nav_order: 2
permalink: /blog/Security/MemLabs/LAB2
parent: MemLabs
grand_parent: Security
has_children: false
---

# MemLabs Lab 2 : A New World #
{: .no_toc }

Lab 2 here we come! This is the second solo lab in this series (created by MemLabs),
that we are totally on our own for! This challenge has three flags we will have
to find just like the last but I'm sure this will take a new approach than last
time (Why? Well just look at the challenge name). Why don't we read through the
prompt we are given for this challenge.

> "One of the clients of our company, lost the access to his system due to an unknown
> error. He is supposedly a very popular "environmental" activist. As a part of
> the investigation, he told us that his go to applications are browsers, his
> password managers etc. We hope that you can dig into this memory dump and find
> his important stuff and give it back to us."

Okay, so an error occured that caused his system to lose accessibility. We know this
is most likely a Windows box, so maybe a command was run that caused this, we will
check for that. Next sentence: "environmentalist" okay maybe there was some software
he was using for this, oh but then we see that he likes his browsers and password
managers a lot, we can check browser cache, history, and saved passwords then! This
was a handy prompt, so let's get to work.

## Table of contents ##
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Flag 1 ##

### Find Profile ###

Lets first, as always get the profile of this device from the memory dump. Again,
we will use the tool Volatility for this challenge. Let's extract the archive we
are given with the `.raw` file inside and get cracking!

```bash
❱ volatility -f *.raw imageinfo
...
Suggested Profile(s) : Win7SP1x64, Win7SP0x64, Win2008R2SP0x64, Win2008R2SP1x64
24000, Win2008R2SP1x64_23418, Win2008R2SP1x64, Win7SP1x64_24000, Win7SP1x64_23418
    AS Layer1 : WindowsAMD64PagedMemory (Kernel AS)
...
```

For the rest of this challenge, let's stick with the first profile that Volatility
suggests for us: `Win7SP1x64`.

### Process List ###

We have our profile now, so lets look at each process running on the system on
the RAM, to do this I'm going to go with the `pstree` command instead of `pslist`
because the output is much more organized in a way that shows parent/child processes.

```bash
❱ volatility -f *.raw --profile Win7SP1x64 pstree
 0xfffffa8000e9a110:explorer.exe     2664   2632     19    632 2019-12-14 10:36:29 UTC+0000
. 0xfffffa8000edcb30:VBoxTray.exe    2792   2664     12    139 2019-12-14 10:36:30 UTC+0000
. 0xfffffa80022e5950:cmd.exe         2096   2664      1     19 2019-12-14 10:36:35 UTC+0000
. 0xfffffa8002109b30:chrome.exe      2296   2664     27    658 2019-12-14 10:36:45 UTC+0000
.. 0xfffffa8001cc7a90:chrome.exe     2304   2296      8     71 2019-12-14 10:36:45 UTC+0000
.. 0xfffffa8000ea2b30:chrome.exe     2964   2296     13    295 2019-12-14 10:36:47 UTC+0000
.. 0xfffffa8000fae6a0:chrome.exe     2572   2296      8    177 2019-12-14 10:36:56 UTC+0000
.. 0xfffffa800230eb30:chrome.exe     1632   2296     14    219 2019-12-14 10:37:12 UTC+0000
.. 0xfffffa8000eea7a0:chrome.exe     2476   2296      2     55 2019-12-14 10:36:46 UTC+0000
...
 0xfffffa80011956a0:notepad.exe      3260   3180      1     61 2019-12-14 10:38:20 UTC+0000
...
```

So here we can see a list of the running processes in a tree form which is better
because we know which process spawned what, and right away we can see two suspicious
separate trees of target processes. Im going to be looking at the notepad one first,
I'm almost certain there has to be a flag somewhere in that, all characters typed
into notepad is stored into memory somewhere so lets target that first.

### Command Scan ###

Just for process sake, I'm going to first see if there is any useful commands
being run. Let's check using `cmdscan`:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 cmdscan
**************************************************
CommandProcess: conhost.exe Pid: 2068
CommandHistory: 0x3deb10 Application: cmd.exe Flags: Allocated, Reset
CommandCount: 1 LastAdded: 0 LastDisplayed: 0
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0x60
Cmd #0 @ 0x3db330: Nothing here kids :)
Cmd #15 @ 0x3a0158: =
Cmd #16 @ 0x3ddc80: >
**************************************************
...
```

Well this might be a wild goose chase but it also could be hiding something happening,
so let's remember to keep this in the back of our heads. For now lets move on.

### Check stdout ###

Next, again for the sake of the process of doing this, let's just check stdout
in case there is anything useful in there. We will use `consoles` for this:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 consoles
ConsoleProcess: conhost.exe Pid: 2068
Console: 0xff1e6200 CommandHistorySize: 50
HistoryBufferCount: 1 HistoryBufferMax: 4
OriginalTitle: %SystemRoot%\system32\cmd.exe
Title: C:\Windows\system32\cmd.exe
AttachedProcess: cmd.exe Pid: 2096 Handle: 0x60
----
CommandHistory: 0x3deb10 Application: cmd.exe Flags: Allocated, Reset
CommandCount: 1 LastAdded: 0 LastDisplayed: 0
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0x60
Cmd #0 at 0x3db330: Nothing here kids :)
----
Screen 0x3c0ff0 X:80 Y:300
Dump:
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Users\SmartNet>Nothing here kids :)
'Nothing' is not recognized as an internal or external command,
operable program or batch file.

C:\Users\SmartNet>
...
```

Well, I guess it was just a wild goose chase, of course `Nothing here kids :)`
isn't a valid command so it just gave an error, we can move on knowing this was
nothing though at least.

### Environment Variables ###

This is a weird one... Lets check our environment variables (this is just the way
I like to do it to cover all ends). To do this we will use the `envars` function:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 envars
...
3852 conhost.exe   0x000000000014d880 NEW_TMP    C:\Windows\ZmxhZ3t3M2xjMG0zX1QwXyRUNGczXyFfT2ZfTDRCXzJ9
...
```

See how I said this was weird... Well look what is right there in plain sight,
a freaking base64 string lol! How funny is that! I was checking envars just for
process sake and it ended up saving me, thankyou Mr. Process sir! Lets convert
this base64 string real quick and see what we get:

```bash
echo "ZmxhZ3t3M2xjMG0zX1QwXyRUNGczXyFfT2ZfTDRCXzJ9" | base64 -d -
flag{w3lc0m3_T0_$T4g3_!_Of_L4B_2}%
```

Well would you look at that, we have our first flag and by complete accident!
How awesome is that haha! Move on to the next flag? I think we shall!

```
flag{w3lc0m3_T0_$T4g3_!_Of_L4B_2}
```

---

## Flag 2 ##

### Hash dump ###

Well the process didn't fail us before, lets see if it can keep helping us, I'm going
to check the hashes from `hasdump` real quick to see if there are any useful ones,
if not we can move on:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 hasdump
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SmartNet:1001:aad3b435b51404eeaad3b435b51404ee:4943abb39473a6f32c11301f4987e7e0:::
HomeGroupUser$:1002:aad3b435b51404eeaad3b435b51404ee:f0fc3d257814e08fea06e63c5762ebd5:::
Alissa Simpson:1003:aad3b435b51404eeaad3b435b51404ee:f4ff64c8baac57d22f22edc681055ba6:::
```

->

| Administrator  |                  |
| Guest          |                  |
| SmartNet       | smartnet123      |
| HomeGroupUser  | NotFound         |
| Alissa Simpson | goodmorningindia |

Well it looks like all of these are the same as in the first lab, but thats okay,
we know that for sure now so can check that off our list.

### Memory Dump Notepad ###

Okay, so I'm finally gonna point my full focus to `notepad.exe` now, our standard
process is pretty much over and we've found the first flag, so let's get to Notepad
now. First thing first, let's get a dump of this executable, `memdump` is the perfect
tool for this. Remember to look back at ur `pstree` to find the PID of `notepad.exe`:

```bash
# `-p` specifies PID, `-D` is dump directory
❱ volatility -f *.raw --profile Win7SP1x64 memdump -p 3260 -D .
```

So because we are looking through notepad.exe memory, I decided that we could
just try looking at strings in the file (`strings 3260.dmp | less`) and scrolling
through I found a very useful output that I can't remember where I actually saw
somewhere else as well.

```bash
C:\Windows\system32\NOTEPAD.EXE
C:\Users\SmartNet\Secrets\Hidden.kdbx
f97)l
"C:\Windows\system32\NOTEPAD.EXE" C:\Users\SmartNet\Secrets\Hidden.kdbx
```

You know what I think I noticed this in a `cmdline` scan through. Lets check:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 cmdline
...
KeePass.exe pid:   3008
Command line : "C:\Program Files (x86)\KeePass Password Safe 2\KeePass.exe" "C:\Users\SmartNet\Secrets\Hidden.kdbx"
...
************************************************************************
notepad.exe pid:   3260
Command line : "C:\Windows\system32\NOTEPAD.EXE" C:\Users\SmartNet\Secrets\Hidden.kdbx
...
```

Well would you look at that! A password manager! Looking up `.kdbx` file type,
I found that sure enough it is the password database file for `KeePass Password
Safe 2`. I wonder why the user is opening this file in notepad though, lets try
extracting this file in a sec, but I'm not content yet enough with notepad. In
a resource posted below, supposedly notepad stores text in memory as 16-bit
little endian so lets run strings again but with these two traits in mind.

```bash
# `-e` is for encoding, `l` is for 16 bit little endian
strings -e l 3260.dmp | less
...
Simpson\AppData\Roaming\Microsoft\Windows\Recent\Hidden.kdbx.lnk
...
Google Chrome.lnk
Chrome
Password.png
Password.lnk
Password.png
Password.lnk
%USERPROFILE%\AppData\Local\Microsoft\Windows\History\History.IE5\MSHist012019121420191215
:2019121420191215:
My Pictures
My Pictures.lnk
My Pictures
My Pictures.lnk
@7:\W
Hidden.kdbx
Hidden.kdbx.lnk
%0rog
Hidden.kdbx
Hidden.kdbx.lnk
Secrets
Secrets.lnk
...
\Device\HarddiskVolume2\Users\Alissa Simpson\AppData\Roaming\Microsoft\Windows\Recent\Hidden.kdbx.lnk
...
```

There was quite a bit of information in this executable, here are some of the
lines that were most suspicious and interesting that I found, there are probably
so many more too but that dmp file was massive. With `strings` using those flags
so much more was cleartext compared to the first time we tried strings.

I think it's about time we try to dump some files, the most interesting one right
now has to be `Hidden.kdbx` so lets do that.

### Dump Files ###

Dumping files is easier than it sounds once you know how to do it. Letst start
first by using `filescan` to find the exact offset of the file we are trying to
dump:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 filescan | grep -i "Hidden"
0x000000003fb112a0     16      0 R--r-- \Device\HarddiskVolume2\Users\SmartNet\Secrets\Hidden.kdbx
```

To dump this file we will use the `dumpfiles` command, set our offset with `-Q`,
and our dump directory with `-D`:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 dumpfiles -O 0x000000003fb112a0 -D .
DataSectionObject 0x3fb112a0   None   \Device\HarddiskVolume2\Users\SmartNet\Secrets\Hidden.kdbx
```

Awesome, we now have the hidden secrets database file, shall we try breaking it open?
So, I tried downloading KeyPass software actually (open source keypassxc if you care
to know) but when trying to open the file we got from our dump it requires a master
password which stinks for us but is all part of the fun, we just have to find a way
to get into the database.

So some time has passed and I haven't gotten very far, tried many different things,
dumped a few more files, but to no visible avail, I feel like I'm totally overlooking
something.

About another 15 minutes passed and somehow my eye caught `Password.png` in
[Memory Dump Notepad](#memory-dump-notepad), how did I not even notice this before.
Lets dump this file. I think you know how to by now, and open it in an image viewer.
Oh my goodness!!! This is such a useful picture!!! First, they give us a blog to view
[VolatileVirus](https://volatilevirus.home.blog) and second, if you look closely at the
bottom right it says:

> "Psst!! password is P4SSw0rd_123"

No way!! Let's try this with the KeePass software on the Hidden.kdbx file that we
dumped!! By the way, be sure to cp the dump `.dat` file to a file with `.kdbx` or
KeePass won't be able to see it. IT WORKS! The password works guys! We now are into
that database that had us stumped for quite a bit! If you are using KeePassXC (Cross
Platform and Open Source version) if you view `General` there are 4 fake keys in
there, these obviously aren't helpful, don't fret though, check the `Recycle Bin`
tab. Yep, that's right... we just got our second flag! Double click on the entry
with title `Sabka Baap` and username `Flag`, this will open the Edit Entry menu,
and finally click the little eye icon to view that password... there we go, our
second flag for lab 2!!

```
flag{w0w_th1s_1s_Th3_SeC0nD_ST4g3_!!}
```

---

## Flag 3 ##

Movind on to our third flag, I think I'm feeling really confident now,
sure the second flag threw us on some wacky wild goose chases and stumped
us for a bit at some points in it, but we got it and sure enough it was
just a little image we originally missed that got us there. We still have
to check that blog out now too don't we! Maybe it can help us find the third
and final flag and call this challenge a win!

### Chrome History ###
So the last step in this challenge just has to be something to do with a browser
and that would most likely be chrome. After some digging around, I found someone
who created some volatility plugins for different functions to enumerate multiple
chrome functions. These are on a [git repo](https://github.com/superponible/volatility-plugins),
clone them wherever and I'll show you how to point volatility to use these! So
the `chromehistory.py` file in this repo actually has multiple usable chrome
functions [shown here](https://blog.superponible.com/2014/08/31/volatility-plugin-chrome-history/)
but the one we want to check right now would just be `chromehistory` because
I just want to see what the heck our victim was viewing on his favorite browser.

```bash
# Simply specify the directory of the plugins you want to use, everything else
# is the same, don't need a profile though
❱ vol.py --plugins=~/Downloads/volatility-plugins/ -f *.raw chromehistory
Index  URL                                                                              Title                                                                            Visits Typed Last Visit Time            Hidden Favicon ID
------ -------------------------------------------------------------------------------- -------------------------------------------------------------------------------- ------ ----- -------------------------- ------ ----------
    34 https://bi0s.in/                                                                 Amrita Bios                                                                           1     1 2019-12-14 10:37:11.596681        N/A
    33 http://bi0s.in/                                                                  Amrita Bios                                                                           1     0 2019-12-14 10:37:11.596681        N/A
    32 https://mega.nz/#F!TrgSQQTS!H0ZrUzF0B-ZKNM3y9E76lg                               MEGA                                                                                  2     0 2019-12-14 10:21:39.602970        N/A
    31 https://www.ndtv.com/                                                            NDTV: Latest News, India News, Breaking...s, Bollywood, Cricket, Videos & Photos      1     1 2019-12-14 10:18:09.449115        N/A
    30 http://ndtv.com/                                                                 NDTV: Latest News, India News, Breaking...s, Bollywood, Cricket, Videos & Photos      1     0 2019-12-14 10:18:09.449115        N/A
    28 http://blog.bi0s.in/                                                             bi0s                                                                                  1     0 2019-12-14 09:41:52.269568        N/A
    29 https://blog.bi0s.in/                                                            bi0s                                                                                  1     1 2019-12-14 10:18:12.073607        N/A
    27 https://r3xnation.wordpress.com/about/                                           About – R3xNation                                                                   1     0 2019-12-14 10:07:31.296539        N/A
    26 https://www.youtube.com/                                                         YouTube                                                                               1     1 2019-12-14 10:04:59.173510        N/A
    24 http://in.yahoo.com/                                                             Yahoo India | News, Finance, Cricket, Lifestyle and Entertainment                     1     0 2019-12-14 09:33:25.210345        N/A
    23 http://yahoo.in/                                                                 Yahoo India | News, Finance, Cricket, Lifestyle and Entertainment                     1     1 2019-12-14 09:33:25.210345        N/A
    25 https://in.yahoo.com/                                                            Yahoo India | News, Finance, Cricket, Lifestyle and Entertainment                     2     0 2019-12-14 09:33:32.266003        N/A
    21 https://www.bbc.com/sport/football/50780855                                      Jurgen Klopp signs new Liverpool deal until 2024 - BBC Sport                          1     0 2019-12-14 09:31:35.842850        N/A
    19 https://bbc.com/                                                                 BBC - Homepage                                                                        1     1 2019-12-14 09:30:55.836868        N/A
    18 http://bbc.com/                                                                  BBC - Homepage                                                                        1     0 2019-12-14 09:30:55.836868        N/A
    20 https://www.bbc.com/                                                             BBC - Homepage                                                                        1     0 2019-12-14 09:30:55.836868        N/A
    17 https://volatilevirus.home.blog/blog-posts/                                      Blog Posts – Abhiram's Blog                                                         1     0 2019-12-14 10:07:35.236223        N/A
    16 https://ashutosh1206.github.io/writeups/                                         Writeups | Ashutosh                                                                   1     0 2019-12-14 10:07:32.324863        N/A
    15 https://www.india.com/                                                           Latest India News, Breaking News, Entertainment News | India.com News                 1     1 2019-12-14 09:30:08.206258        N/A
    14 https://www.onlinesbi.com/                                                       State Bank of India                                                                   1     1 2019-12-14 09:29:37.802253        N/A
    12 http://ashutosh1206.github.io/                                                   Home | Ashutosh                                                                       1     0 2019-12-14 09:29:33.876790        N/A
    13 https://ashutosh1206.github.io/                                                  Home | Ashutosh                                                                       1     1 2019-12-14 09:29:33.876790        N/A
    10 http://r3xnation.wordpress.com/                                                  R3xNation – Free Flowing passions                                                   1     0 2019-12-14 09:29:17.212089        N/A
     9 https://volatilevirus.home.blog/                                                 Abhiram's Blog – Dying Is The Day Worth Living For!!                                1     1 2019-12-14 09:27:31.877522        N/A
     8 http://volatilevirus.home.blog/                                                  Abhiram's Blog – Dying Is The Day Worth Living For!!                                1     0 2019-12-14 09:27:31.877522        N/A
    11 https://r3xnation.wordpress.com/                                                 R3xNation – Free Flowing passions                                                   1     1 2019-12-14 09:29:17.212089        N/A
     7 https://www.facebook.com/                                                        Facebook – log in or sign up                                                        3     1 2019-12-14 09:33:15.814086        N/A
     4 http://bing.com/                                                                 Bing                                                                                  1     0 2019-12-14 09:16:18.118193        N/A
     6 https://www.bing.com/?toWww=1&redig=2BBD701F84AA44D2A71D870534D085AE             Bing                                                                                  1     0 2019-12-14 09:33:00.366479        N/A
     5 https://bing.com/                                                                Bing                                                                                  1     1 2019-12-14 09:16:18.118193        N/A
     3 https://www.google.com/                                                          Google                                                                                2     1 2019-12-14 09:32:52.147284        N/A
     2 https://chrome.google.com/webstore/category/extensions?hl=en                     Chrome Web Store - Extensions                                                         1     0 2019-12-14 09:32:53.844597        N/A
     1 https://chrome.google.com/webstore?hl=en                                         Chrome Web Store - Extensions                                                         1     0 2019-12-14 09:16:05.724461        N/A
```

Here is what we got, any useful information in here?

> Side note: I completely missed the mega link there somehow the first time I looked
> through this so that wasted some time going through each of these links haha!

### Extract Data ###

Yes! A mega link, that is completely suspicious, let's check it out! Woah its a `zip`
file named `Important.zip`, this has to be the final flag! I downloaded the zip
to my system, tried to extract it and got this:

```bash
❱ unzip Important.zip
Archive:  Important.zip
Password is SHA1(stage-3-FLAG) from Lab-1. Password is in lowercase.
   skipping: Important.png           unsupported compression method 99
```

Well luckily we did Lab-1, lets retrieve that flag real quick and convert it using
[CyberChef](https://gchq.github.io/CyberChef/#recipe=SHA1()), paste our flag in,
(`flag{w3ll_3rd_stage_was_easy}`), add SHA1 algorithm and we should automatically get
our password there:

```
6045dd90029719a039fd2d2ebcca718439dd100a
```

Lets use this on our zip file and see if this works. Great it did! View the image
and there we go... we got our third and final flag!! We completed another LAB totally
on our own! This is so exciting!

```
flag{oK_So_Now_St4g3_3_is_DoNE!!}
```

---

Hope you enjoyed this blog, this challenge was so fun just like the previous. This
one also seemed to feel quite a large bit easier as well though, maybe that is because
MemLabs was being kind, or we are just getting used to volatility and memory forensics
which what I hope it is haha! Hope you guys have a good rest of you day, was a blast
yall! Shado Out!

---

## Resources ##

- [MemLabs: Lab 2](https://github.com/stuxnet999/MemLabs/tree/master/Lab%202)
- [Volatility Command list](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference)
- [Another Volatility Cheatsheet PDF](https://downloads.volatilityfoundation.org/releases/2.4/CheatSheet_v2.4.pdf)
- [Find notepad strings in memory](https://www.andreafortuna.org/2018/03/02/volatility-tips-extract-text-typed-in-a-notepad-window-from-a-windows-memory-dump/)
