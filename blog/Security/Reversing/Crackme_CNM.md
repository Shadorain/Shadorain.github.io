---
layout: default
title: "Crackme - Crackme not Main"
nav_order: 1
permalink: /blog/Security/Reversing/Crackme_CNM
parent: Reversing
grand_parent: Security
has_children: false
---

# Crackme Not Main - Crackme Writeup

Author: kawaii-flesh | Level: 2.0 | Quality: 4.5 | Platform: Unix/Linux | Language: C/C++

## Introduction

This crackme has been provided by [crackmes.one](https://crackmes.one).

For all my solutions, I will use radare2: a fantastic terminal user interface
reversing tool that amazes me daily on its immense potential. So when I use a
`:> ` it is a radare2 shell command (from Visual modes you can get to this via
the `:` key just like in vim). When I use `❱ ` it is referring to a normal shell
command. With that out of the way let's get to the meat of it!

---

## Part One
### First Check

```nasm
lea rax, [var_60h]
mov rsi, rdx
mov rdi, rax
call sym.imp.strcmp
```

```bash
❱ afvd      # check existing variables
...var var_60h = 0x7ffc230acea0 = (qword)0x0000004d4e432f2e...
❱ ps @ 0x7ffc230acea0   # print string of address
./CNM
```

Lets try setting a breakpoint right after the first jump `0x55a41a4591fe`.
It seems `strcmp` is comparing our first input with `var_60h`:`./CNM`, it's
just the name of the crackme binary. Set the breakpoint, continue to it and
test our first input:

```bash
:> db 0x55a41a4591fe
:> dc
Enter Key: ./CNM
```

Ooh nice it hit our breakpoint! This means our first input was correct, onto
the next one!

```note
If you've looked ahead at all after that first check, we need to go right from
here on down the graph (VV), this means we need all our jumps to be true to reach
this block that gives us our win: `0x55a41a4592a0`.
```

### Second Check

I was looking way too deeply this whole time. Reading every line of assembler
isn't always the way to go. I learned this the hard way when I popped open
a `:> vvv` for some reason the colors of the numbers in the `cmp` statements popped out to be and I realized, why didn't I just go down the list of all the blocks
and check them in the binary... turns out that worked :') **sigh**. It was as simple
as acknowledging the scanf's format string as `%d` and putting the right number
in that the cmp checked for, but I for some reason wanted to read every line and
variable. But! It's okay because we have a solution!

```nasm
lea rdi, 0x558e62ba78ff  ; %d
mov eax, 0
call sym.imp.__isoc99_scanf
mov eax, dword [var_6ch]
cmp eax, 1
```

Here, the program takes the format string `%d` and puts it into the `rdi` register,
then set `eax` to `0`, and calls the `scanf` method to get input from the user which
gets put into the `var_6ch` variable and compared with `0x1` sending us to the next
block if the compare passes. This repeats for the next three checks:

```nasm
...
cmp eax, 7
...
cmp eax, 8
...
cmp eax, 5
...
```

`eax` gets cleared (set to 0), `scanf` for input and `cmp` for correct number.

```bash
❱ ./CNM
Enter Key: ./CNM
1
7
8
5
Good Key!
```

Look-y here its our fine solution, simple as that!

---

## Part Two
### Discovery

Wait that was too easy, why is this codeblock so long. Let's read the disassembly.
Here is what I get from r2:

```nasm
0x000012a0  lea rsi, [0x00036902]       ; "a" ; const char *mode
0x000012a7  lea rdi, str.CNP.7z         ; 0x36904 ; "CNP.7z" ; const char *filename
0x000012ae  call sym.imp.fopen          ; file*fopen(const char *filename, const char *mode)
0x000012b3  mov qword [stream], rax
0x000012b7  mov rax, qword [stream]
0x000012bb  mov rcx, rax                ; FILE *stream
0x000012be  mov edx, 0x348ce            ; size_t nitems
0x000012c3  mov esi, 1                  ; size_t size
0x000012c8  lea rdi, [0x00002020]       ; "7z\xbc\xaf'\x1c" ; const void *ptr
0x000012cf  call sym.imp.fwrite         ; size_t fwrite(const void *ptr, size_t size, size_t nitems, FILE *stream)
0x000012d4  lea rdi, str.Good_key_      ; 0x3690b ; "Good key!" ; const char *s
0x000012db  call sym.imp.puts           ; int puts(const char *s)
0x000012e0  jmp 0x12ee
```

Why is there a file being opened? R2 automatically converts the hex for us
to a readable string `"CNP.7z"`, isn't this the archive file that we extracted
to get our binary? Reading further, this file is opened with append permissions 
(line `0x12a0` puts `'a'` on the stack which is the mode for `fopen`), and later
written to with `fwrite`: `"7z\xbc\xaf'\x1c"` some unreadable hex data, then
then we get our `Good Key!` message.

> Now I realize what the name of this crackme means! The crackme isn't the main
> challenge, this file is! If we looked ahead we wouldnt even need to have
> cracked this crackme and simply could have written that hex line directly
> onto the end of the `CNP.7z` file. What a sneaky challenge!!

### XOR_REV, hm...

We extracted this file previously but there new data added to it this time so
let's see if we get new files or what! 

```bash
❱ 7z x CNP.7z
...
Files: 2
...
```

Well this is different! We only got our crackme previously but now there is 2
files. Let's check: `❱ ls` and we do! This gave us two new files: `key` and
`XOR_REV(QWER=RIFF)` what a weird name... probably a hint in that. So like
every file I tried to open it using `vim` and its a binary file so that isn't
helpful. `file` gave me no info either on what type of file it is. `XOR` is
interesting though, I have heard it is possible to XOR two files together...
we have two files.

Let's try that: I found a C program online that Bitwise ORs two files together,
this is simple to change that to a XOR (`|` -> `^`) though so lets use it!:

```c
#include <stdio.h>
#include <string.h>

#define BS 1024

int main() {
    FILE *f1, *f2, *fout;
    size_t bs1,bs2;
    char buffer1[BS], buffer2[BS], bufferout[BS];

    f1 = fopen("key", "r");
    f2 = fopen("XOR_REV(QWER=RIFF)", "r");
    fout = fopen("merged_file", "w");

    if (!(f1 && f2 && fout)) return 1;

    while(1) {
        bs1 = fread(buffer1, 1, BS, f1);    /* Read files to buffers, BS bytes at a time */
        bs2 = fread(buffer2, 1, BS, f2);

        size_t x;
        for(x = 0; bs1 && bs2; --bs1, --bs2, ++x)     /* If we have data in both, */
            bufferout[x] = buffer1[x] ^ buffer2[x];   /* write XOR of the two to output buffer */

        memcpy(bufferout+x, buffer1+x, bs1);          /* If bs1 is longer, copy the rest to the output buffer */
        memcpy(bufferout+x, buffer2+x, bs2);          /* If bs2 is longer, copy the rest to the output buffer */

        x += bs1 + bs2;
        fwrite(bufferout, 1, x, fout);

        if (x != BS) break;
    }
}
```

Compile and run it:
```bash
❱ gcc sploit.c
❱ ./a.out
❱ ls
...  merged_file ...
```

Sweet we have our XOR'ed file! Let's see if it actually worked though lol!

### -.- Sweet RIFFs .-.

```bash
❱ vim merged_file
QWERjÒ^A^@WAVEfmt ^P^@^@^@^A^@^A^@ ^O^@^@@^_^@^@^B^@^P^@data^@Ò^A^@^A<80>þ~^B<80>
ÿ~^@<80>^A^?^@<80>^B^?^@<80>^@^?^A<80>þ~^C<80>ü~^D    <80>ý~^B<80>ÿ~^@<80>^A^?^@<80>
^@^?^@<80>^A^?^@<80>^@^?^A<80>þ~^C<80>ý~^A<80>^@^?^A<80>þ~^B<80>þ~^A<80>^A^?^@<80>
^B^?^@<80>^B^?^@<80    >^B^?^@<80>ÿ~^B<80>ý~^C<80>þ~
...
```

Welp, another binary file... holy crap!!! LOOK: `QWER`, our file says something
about this! Maybe it really was a hint! `QWER=RIFF`, let's try changing that
to `RIFF`, we can do this strait from `vim`, or if you aren't comfortable with
vim yet, try a hex editor, hexedit is a good one! (should be in your repository)
The power of U/Linux is just overwhelming, unix does not differentiate between
binary files or text files making it completely possible literally to just edit
the strait binary text. Take that Windows ;)!

After changing those characters, I found via `file` that it is actually a WAV file!
That is audio! We are getting somewhere, this is so exciting!

```bash
❱ file merged_file
merged_file: RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, mono 4000 Hz
```

Check that out: `RIFF` is an actual header and audio encoding type it seems!
Let's try to play the track, `mpv` is a very handy cli tool for playing just about
anything if you needed a software recommendation to play audio!

Okay, it's definitelly morse code, but decoding it is unhelpful data... almost
like it is backwards. Well darn it, that file did us in again, `XOR_*REV*`.
Lol let's try reversing this audio track now. If you have a program named `sox`
available on your system it is very simple to do:

```bash
❱ sox merged_file reversed.wav reverse
```

This time I am going to use an audio production tool to visualize our audio
to make it simpler for everyone (14 seconds of strait morse isn't easy to decode
by ear). Audacity displays our audio with large gaps (pauses), small blocks (dots),
and larger blocks (dashes). If we write it out:

`.---- ....- .---- ...-- ..... -.... --... ---.. ----- ----.`

Lets throw this into a website real quick to see what it means in readable english.
[This](https://morsecode.world/international/translator.html) website is good enough!
Paste the morse into there and get our final flag!

` FLAG: 1413567809 `

There it is! We have found the flag!

---

## Closing

Overthinking sure can lead one on a serious wild goose chase, but this has been
a fun crackme and my first completed without any guidance at all! Has been a
nice learning experience for radare2 as well which is very nice. Oh wait that was
just [part one](#part-one) lol.

In [part two](#part-two) we dug into some more CTF style of a challenge which
was a pleasant surprise! We had to manipulate files and even decode morse code!
Was definitelly unexpected but quite fun!

I hope you enjoy this writeup and learned a bit more about radare2 and reverse
engineering, a bit more too in this challenge!  I sure did! Thanks for sticking
around and have a blessed day! Shado out.

