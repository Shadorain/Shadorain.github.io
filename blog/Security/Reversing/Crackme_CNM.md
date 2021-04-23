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

Author: kawaii-flesh | Level: 1.0 | Quality: 4.0 | Platform: Unix/Linux | Language: C/C++

## Introduction

This crackme has been provided by [crackmes.one](https://crackmes.one).

For all my solutions, I will use radare2: a fantastic terminal user interface
reversing tool that amazes me daily on its immense potential. So when I use a
`:> ` it is a radare2 shell command (from Visual modes you can get to this via
the `:` key just like in vim). When I use `❱ ` it is referring to a normal shell
command. With that out of the way let's get to the meat of it!

---

## First Check

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

## Second Check

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

## Closing

Overthinking sure can lead one on a serious wild goose chase, but this has been
a fun crackme and my first completed without any guidance at all! Has been a
nice learning experience for radare2 as well which is very nice.

Hope you enjoy this writeup and learned a bit about radare2 and reverse engineering!
I sure did! Thanks for reading and have a blessed day! Shado out.
