---
layout: default
title: MemLabs LAB1 Beginners Luck
nav_order: 5
permalink: /blog/Security/MemLabs/LAB1
parent: MemLabs
grand_parent: Security
has_children: false
---

# MemLabs Lab 1 : Beginner's Luck #

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

## Find Profile ##

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

## Process List ##

Now that we have our profile, its time to see what processes are running on this machine,
the main ones I'm looking for are `cmd.exe` (Windows Command Prompt), `explorer.exe`
(Internet Explorer) to see if there are any browser cache files, and something to do with
drawing, not exactly sure what that will look like yet, maybe `paint.exe`? Lets start with
using the famous and handy `pslist` plugin in volatility:

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

## Command Scan ##

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

### Side Note ###

Just a little side note... I just realized what this means: `St4G3$1`.
Look a little closer, try replacing the numbers with letters... Yeah that was a hint
and I totally missed it earlier, if you noticed it good job!

> St4G3$1 -> Stage 1

That was the hint to tell us we were close to finding stage 1 then! Either way we
still got it so lets find Stage 2!

## Check stdout ##

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

## Environment Variables ##

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

## Hash dump ##

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

## Resources ##

- [MemLabs: Lab 1](https://github.com/stuxnet999/MemLabs/tree/master/Lab%201)
- [Volatility Command list](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference)

