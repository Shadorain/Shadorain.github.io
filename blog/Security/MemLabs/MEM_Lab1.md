---
layout: default
title: "LAB1 : Beginners Luck"
nav_order: 1
permalink: /blog/Security/MemLabs/LAB1
parent: MemLabs
grand_parent: Security
has_children: false
---

# MemLabs Lab 1 : Beginner's Luck #
{: .no_toc }

This is the first Lab that we are totally on our own for in this series of challenges
so lets get to it! Let's first read our little prompt/hint:

> "My sister's computer crashed. We were very fortunate to recover this memory dump.
> Your job is get all her important files from the system. From what we remember, we
> suddenly saw a black window pop up with some thing being executed. When the crash
> happened, she was trying to draw something. Thats all we remember from the time
> of crash."

Ok so it looks like, a command prompt opened right when the system crashed,
potential malware? Wonder what that means that "she was trying to draw something",
but this has to be a useful hint.

## Table of contents ##
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Flag 1 ##

### Find Profile ###

Lets first get the profile of this device from the memory dump, volatility is the
tool we will be using for this Lab and all future ones. To do this run:
Note - Don't forget to extract the archive first...

```bash
❱ volatility -f MemoryDump_Lab1.raw imageinfo   # we can also run kdgbscan as well
                                  # instead of imageinfo but this enough for now
...
Suggested Profile(s) : Win7SP1x64, Win7SP0x64, Win2008R2SP0x64, Win2008R2SP1x64_24000,
Win2008R2SP1x64_23418, Win2008R2SP1x64, Win7SP1x64_24000, Win7SP1x64_23418
AS Layer1 : WindowsAMD64PagedMemory (Kernel AS)
...
```

Looking for the profiles that volatility finds, we can test with different suggested
ones, but lets just use the first in our commands.

### Process List ###

Now that we have our profile, its time to see what processes are running on this
machine, the main ones I'm looking for are `cmd.exe` (Windows Command Prompt),
`explorer.exe` (File Explorer) to see if there are any browser cache files,
and something to do with drawing, not exactly sure what that will look like yet,
maybe `paint.exe`? Lets start with using the famous and handy `pslist` plugin in
volatility:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 pslist
...
0xfffffa8002046960 explorer.exe     604   2016   33   927   1   0 2019-12-11 14:32:25 UTC+0000
0xfffffa8002222780 cmd.exe         1984    604    1    21   1   0 2019-12-11 14:34:54 UTC+0000
0xfffffa80022bab30 mspaint.exe     2424    604    6   128   1   0 2019-12-11 14:35:14 UTC+0000
0xfffffa8000f4c670 explorer.exe    2504   3000   34   825   2   0 2019-12-11 14:37:14 UTC+0000
0xfffffa8001010b30 WinRAR.exe      1512   2504    6   207   2   0 2019-12-11 14:37:23 UTC+0000
0xfffffa8001020b30 SearchProtocol  2868    480    8   279   0   0 2019-12-11 14:37:23 UTC+0000
...
```

This is just a small list of the processes I found most suspicious. There may
be more though so we will look back again if we get stuck. For now, we see our
suspicious command prompt window (`cmd.exe`) that popped up before crashing, and
we even found the mspaint (`mspaint.exe`) instance as well that the sister was
using to draw on. Explorer here is also open in two instances so we will have
to look into those as well. WinRar is open too and I don't exactly know why
unless it was for extracting malware but that doesnt seem realistic, we can
look into that later if we lose our trail with the other more obvious processes.

### Command Scan ###

Next we should look at the different commands running on our `cmd.exe` instance.
To do this lets run volatility with the `cmdscan` plugin:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 cmdscan
**************************************************
CommandProcess: conhost.exe Pid: 2692
CommandHistory: 0x1fe9c0 Application: cmd.exe Flags: Allocated, Reset
CommandCount: 1 LastAdded: 0 LastDisplayed: 0
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0x60
Cmd #0 @ 0x1de3c0: St4G3$1
Cmd #15 @ 0x1c0158:
Cmd #16 @ 0x1fdb30:
**************************************************
CommandProcess: conhost.exe Pid: 2260
CommandHistory: 0x38ea90 Application: DumpIt.exe Flags: Allocated
CommandCount: 0 LastAdded: -1 LastDisplayed: -1
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0x60
Cmd #15 @ 0x350158: 8
Cmd #16 @ 0x38dc00: 8
```

So, here there are two different command processes running, the second is just
the tool used to dump the memory for this challenge `DumpIt.exe` so we care
more about the first one here. `conhost.exe` which occured twice in `pslist`
actually but I didn't list it because it didn't seem suspicious started a command
here actually, but I'm not exactly sure yet what it is so we will come back to
this potentially later. For now lets take note of that strange command: `St4G3$1`

#### Side Note ####

Just a little side note... I just realized what this means: `St4G3$1`.
Look a little closer, try replacing the numbers with letters... Yeah that was a hint
and I totally missed it earlier, if you noticed it good job!

> St4G3$1 -> Stage 1

That was the hint to tell us we were close to finding stage 1 then! Either way we
still got it so lets find Stage 2!

### Check stdout ###

Next, I want to check stdout just incase our processes have been writing to it.
To do this we will use the `consoles` plugin in volatility:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 consoles
**************************************************
ConsoleProcess: conhost.exe Pid: 2692
Console: 0xff756200 CommandHistorySize: 50
HistoryBufferCount: 1 HistoryBufferMax: 4
OriginalTitle: %SystemRoot%\system32\cmd.exe
Title: C:\Windows\system32\cmd.exe - St4G3$1
AttachedProcess: cmd.exe Pid: 1984 Handle: 0x60
----
CommandHistory: 0x1fe9c0 Application: cmd.exe Flags: Allocated, Reset
CommandCount: 1 LastAdded: 0 LastDisplayed: 0
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0x60
Cmd #0 at 0x1de3c0: St4G3$1
----
Screen 0x1e0f70 X:80 Y:300
Dump:
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Users\SmartNet>St4G3$1
ZmxhZ3t0aDFzXzFzX3RoM18xc3Rfc3Q0ZzMhIX0=
Press any key to continue . . .
**************************************************
```

I cut out the DumpIt part of this output (in case you are wondering), but look-y
here! It looks like we have some useful output!! I wonder what that string is
it looks like its base64 encoded: `ZmxhZ3t0aDFzXzFzX3RoM18xc3Rfc3Q0ZzMhIX0=` so
let's try decoding it:

```bash
❱ echo "ZmxhZ3t0aDFzXzFzX3RoM18xc3Rfc3Q0ZzMhIX0=" | base64 -d -
flag{th1s_1s_th3_1st_st4g3!!}
```

Well! It looks like we got our first flag! Be proud, I know it was simple but its
always nice to see those sweet flags, ya know!? Well, we aren't finished yet silly
we have two more to figure out! Lets get to some more work!

### Environment Variables ###

Why not check if there are any useful or suspicious environment variables! Assuming
the sister doesn't use computers much, there might be some made by the malicious
actor in this scenario if there is one so lets take a look. To do this let's utilize
the handy `envars` plugin in volatility to get a nice list:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 envars
```

We may actually have to run this through a pager such as the common GNU `less`
utility or my favorite, `bat`, to be able to digest this massive load of output,
or we could possibly grep through it as well for special keywords such as certain
processes or strings we've seen before.

Doing this, we can see the sisters full name "Alissa Simpson" since it is her
\Users\ account. Something suspicious though is the other user that comes up
even more frequently which is "SmartNet-PC" but it looks like this is the user
using the DumpIt tool so I'm not sure if this is just a rabbit trail. There
is though a logfile that repeatedly has shown up though that looks to be in a suspicious
directory `C:\BVTBin\Tests\installpackage\csilogfile.log`, wonder if we could get
our hands on that. For now lets try a different approach though.

### Hash dump ###

Lets try getting a hash dump of the passwords on the system currently and try to
brute force them. To get the hashes lets use the `hashdump` plugin in volatility:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 hasdump
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SmartNet:1001:aad3b435b51404eeaad3b435b51404ee:4943abb39473a6f32c11301f4987e7e0:::
HomeGroupUser$:1002:aad3b435b51404eeaad3b435b51404ee:f0fc3d257814e08fea06e63c5762ebd5:::
Alissa Simpson:1003:aad3b435b51404eeaad3b435b51404ee:f4ff64c8baac57d22f22edc681055ba6:::
```

There are quite a few hashes here, I'm quite certain these are NTLM hashes which
seems to be common on Windows so lets see first if an online hash search could
"reverse" one of these for us.

| Administrator  |                  |
| Guest          |                  |
| SmartNet       | smartnet123      |
| HomeGroupUser  | NotFound         |
| Alissa Simpson | goodmorningindia |

Well that's saddening, I don't think that any of these are too useful unless we were
able to get onto the PC via a shell or physically. But that isn't the scope of memory
forensics so we have to find a different method!

---

## Flag 2 ##

So I ran into quite a ditch pretty fast when attempting different methods to find
the second flag. Went back to the hint, recalled that there was a crash that occurred
so I went through all the different crash plugins but none of them supported our
profile that we were using so I dead ended there, tried almost every other plugin
as well just trying and seeing if there was any useful or suspicious output, but
got nothing. Then I finally ran the `memdump` plugin and crashed my entire blackarch
VM... I ran out of all harddrive space and that caused some wacky issues. So I wanted
to take a small break, but I just realized that I didnt take a look at all at the
memdump and that shoot maybe that could actually be useful, because it dumps the
current memory of each process (or a process u select which I didn't know you could
do at first). Okay rant over, lets get to work.

Remember how to get PID's from the running processes? Yep `pslist`/`pstree`/etc (in
volatility) whichever one you want, just get the PID's of the processes that looked
useful for us. Let's start with `mspaint.exe`: `2424`. Be sure not to simply run
the `memdump` plugin without checking your system free space, it fills up fast. This
command will dump `mspaint.exe` to our current directory into a `.dmp` file:

```bash
# `-p` specifies PID, `-D` is dump directory
❱ volatility -f *.raw --profile Win7SP1x64 memdump -p 2424 -D .
```

This is when I found this [amazing resource](https://w00tsec.blogspot.com/2015/02/extracting-raw-pictures-from-memory.html)
Which gave the most brilliant ideas! Think about what we are trying to do... yep!
View images essentially, right? So why aren't we using a tool like GIMP to help us
out to visualize our memory dump. Let's do that! First we have to `mv` (or Rename
on Win) our `.dmp` file to a `.data` or GIMP wont accept it. Next make sure you have
GIMP installed and run `gimp 2424.data` and it will open two windows, the one we
care about for now is the "Load Image from Raw Data" one. And right away switch
the "Image Type" to `RGB Alpha` so that we can only see the useful data.

Don't hit `Open` yet, we want to find our hidden text first in this dump then we
can do the rest of what we need. So as this link suggests, because mspaint stores
its images as BMPs, it most likely will be flipped and upside-down, so that is a
start. The issue is we don't exactly know what we are looking for yet, maybe text?
Lets start moving around the three main values there, width and height first, then
offset (try to avoid the sliders because they increment too fast and will cause
GIMP to crash).

So for the height, I kept it at around 600-700 just to fill the small window we are
given as a preview, we hardly need to scroll but if you would want to vertically
scroll through the memory be sure to set that much higher. The width and offset are
where it gets confusing. So honestly I've never done this before so I honestly found
it fascinating just to hold the up arrow in the width box and I noticed a white line
that stretched accross the screen, but as I kept holding the line would fade and
a new larger one would show and have like data in it and it eventually became clear
that that was written text and at about width of `4305px` (assuming it is in pixels),

> Note: At `3690px` the text is pretty visible here as well, but not enough for reading
> clearly, so I kept holding the up arrow till the second time it got clearer.

I finally found what took me hours to find! Some text that looks like complete
giberish, but wait! I grabbed my laptop and flipped it over and there it was our
pretty little flag. If we want too we can use offset to make it more seemingly clear
atleast from my experiments but I'm not exactly sure what it does. Lets hit okay
now!

In gimp with our image now prepared, lets use some quick tools to make this easy
for us. The first is in `Tools -> Transformation Tools -> Rotate` or hit `Shift+R`.
Let's rotate our image 180 degrees. And second, `Tools -> Transformation Tools ->
Flip` or `Shift+F`. With this tool selected just click on the image in the viewer
and that should flip it on the y-axis... and lookey here! Is that not our flag!

```
flag{G00d_BoY_good_girL}
```

Well done we have gotten the second flag... wow this is only an "Easy" rated
challenge too, memory forensics is so cool!

---

## Flag 3 ##

This might be a wild goose chase but the process I'm most suspicious of is
WinRar. So I'm going to point my attention to that for the time being to maybe
see if that is what flag 3 is hiding in somewhere. Let's start with a `pstree`
again to see what initiates WinRAR:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 pstree
 0xfffffa8000f4c670:explorer.exe                     2504   3000     34    825 2019-12-11 14:37:14 UTC+0000
. 0xfffffa8000f9a4e0:VBoxTray.exe                    2304   2504     14    144 2019-12-11 14:37:14 UTC+0000
. 0xfffffa8001010b30:WinRAR.exe                      1512   2504      6    207 2019-12-11 14:37:23 UTC+0000
...
```

Okay, of course it's `explorer.exe` that is running it WinRAR, we aren't doing
Linux forensics! Something we haven't run yet is the `cmdline` command to see what
commands are being run and their arguments, I believe that commands are run in the
background even if its a GUI application. So lets see if there are any commands being
run by WinRAR or File Explorer:

```bash
❱ volatility -f *.raw --profile Win7SP1x64 cmdline
...
WinRAR.exe pid:   1512
Command line : "C:\Program Files\WinRAR\WinRAR.exe" "C:\Users\Alissa Simpson\Documents\Important.rar"
...
```

BINGO! Knew WinRAR was something we should look at!! Sweet so now we see that this
`Important.rar` archive is something we need to take a look at. I wonder how we
should go about this to find the data that was compressed inside, maybe we can get
a dump of that archive somehow? Thats the plan! Just found out that there is a command
called `dumpfiles` that we can point to an offset so lets find where in the memory
this file is, to do this lets use the `filescan` utility and grep for `Important.rar`:

### Dump Files ###

```bash
❱ volatility -f *.raw --profile Win7SP1x64 filescan | grep -i "Important.rar"
0x000000003fa3ebc0      1      0 R--r-- \Device\HarddiskVolume2\Users\Alissa Simpson\Documents\Important.rar
0x000000003fac3bc0      1      0 R--r-- \Device\HarddiskVolume2\Users\Alissa Simpson\Documents\Important.rar
0x000000003fb48bc0      1      0 R--r-- \Device\HarddiskVolume2\Users\Alissa Simpson\Documents\Important.rar
```

Well, not exactly sure why it matched three times the same exact file, but this
was the output. So there is our offset: `0x000000003fb48bc0`, lets use the
`dumpfiles` command with our offset to see what is in this archive!

```bash
❱ volatility -f *.raw --profile Win7SP1x64 dumpfiles -O 0x000000003fb48bc0 -D .
DataSectionObject 0x3fb48bc0   None   \Device\HarddiskVolume2\Users\Alissa Simpson\Documents\Important.rar
```

Cool we have the file on our own system now in our current working directory... one
catch though: the file we just got is NOT a rar archive. Lets first look at the first
few bits of this file using `xxd`:

```bash
❱ xxd -l 256 test.dat
00000000: 5261 7221 1a07 0100 06f7 f70b 0b01 0507  Rar!............
00000010: 0006 0101 c5c8 8200 6875 feed 1303 02c0  ........hu......
00000020: 0004 c000 0062 9947 fe80 0000 0343 4d54  .....b.G.....CMT
00000030: 5061 7373 776f 7264 2069 7320 4e54 4c4d  Password is NTLM
00000040: 2068 6173 6828 696e 2075 7070 6572 6361   hash(in upperca
00000050: 7365 2920 6f66 2041 6c69 7373 6127 7320  se) of Alissa's
00000060: 6163 636f 756e 7420 7061 7373 7764 2e00  account passwd..
00000070: d9da 17ab 5802 033c 80c7 0204 dde7 0220  ....X..<.......
00000080: cd37 7c99 8003 0009 666c 6167 332e 706e  .7|.....flag3.pn
00000090: 6730 0100 030f 6ea9 4771 4d53 547d 380d  g0....n.GqMST}8.
000000a0: b206 6cd3 e705 fd3e 6972 4a69 fd48 c56d  ..l....>irJi.H.m
000000b0: fb70 ded8 b735 2ff7 cb5a 4dd0 2f3f ee83  .p...5/..ZM./?..
000000c0: 0cb0 0a03 02af 48a0 c727 b0d5 0177 13f1  ......H..'...w..
000000d0: 5921 12f6 2dac eec0 b40c 79df 15e2 e009  Y!..-.....y.....
000000e0: fc14 4831 0bd6 4f6e 4f0f 4e61 4a28 754c  ..H1..OnO.NaJ(uL
000000f0: 19f6 ab39 7359 7140 212e cd36 87da 8610  ...9sYq@!..6....
```

Well would you look at that! We figured out the password for the archive we
are trying to get into (refer to [Hash Dumps](#hash-dump)) but we have to
be able to convert this data into a RAR file (shown in the first four bytes:)
to then extract the encrypted rar and get that png we see (`flag3.png`)

```python
❱ python2.7
>> a = "52617221".decode("hex")
>> print a
Rar!
```

### Extracting ###

Welp, I went ahead of myself and realized I messed up slightly. The file we
retrieved did actually have a RAR header and I noticed that but it totally
went over my head! The first four bytes of a RAR file always is `5261 7221`
-> `Rar!` and I showed that above, and rechecked this by creating my own rar,
but never took it to mind! We don't even have to do any bit changing, we literally
can just run:

```bash
❱ unrar x test.dat
Extracting from test.dat
Password is NTLM hash(in uppercase) of Alissa's account passwd.
Enter password (will not be echoed) for flag3.png:
```

Let's get that hash from above ([Hash Dumps](#hash-dumps)): `F4FF64C8BAAC57D22F22EDC681055BA6`
Lets convert it to all uppercase.

> **Tip**: if you use vim/nvim like me, try highlighting the hash with visual select
> mode (`v`) then press `U`, it will uppercase the selected area.

If this doesn't work we can try the cracked hash which is `goodmorningindia`.
Great the hash worked just like it was supposed to! And our image is now extracted!
View it and... there you go, flag three is finally complete! We did it! Our first
full memory forensics challenge on our own! That was super fun, super excited to
continue on the next and most likely much more challenging labs!

```
flag{w3ll_3rd_stage_was_easy}
```

---

Hope you enjoyed this blog, I had a lot of fun doing this challenge and writing
this post, stay tuned for more to come! Shado out.

---

## Resources ##

- [MemLabs: Lab 1](https://github.com/stuxnet999/MemLabs/tree/master/Lab%201)
- [Volatility Command list](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference)
- [Another Volatility Cheatsheet PDF](https://downloads.volatilityfoundation.org/releases/2.4/CheatSheet_v2.4.pdf)
- [Extracting Raw Images from Memory](https://w00tsec.blogspot.com/2015/02/extracting-raw-pictures-from-memory.html)
- [Using XXD to Convert dat file to rar](https://whiteheart0.medium.com/retrieving-files-from-memory-dump-34d9fa573033)
