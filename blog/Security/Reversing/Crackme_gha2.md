---
layout: default
title: "Crackme - Guild Hall Adventure Ch.2"
nav_order: 1
permalink: /blog/Security/Reversing/Crackme_gha2
parent: Reversing
grand_parent: Security
has_children: false
---

# Guild Hall Adventure Ch. 2 - Crackme Writeup

Author: ker2x | Level: 2.0 | Quality: 4.0 | Platform: Unix/Linux | Language: C/C++

This crackme has been provided by [crackmes.one](https://crackmes.one).  
Get it here: [Link](http://crackmes.one/crackme/5d1a344033c5d410dc4d0c3e)

## Introduction

For all my solutions, I will use radare2: a fantastic terminal user interface
reversing tool that amazes me daily on its immense potential (with a few other
needed tools mixed in). So when I use a `:> ` it is a radare2 shell command (from
Visual modes you can get to this via the `:` key just like in vim). When I use
`❱ ` it is referring to a normal shell command. With that out of the way let's
get to the meat of this crackme!

---

## Part One


So this is the second part of the crackme story line that `ker2x` has made.
Let's see how the story builds!

Lets open this binary and see what it does without any arguments or anything:

```bash
❱ ./adventure2

    Oooooooooo ! Socially approriate greetings !
    Welcome to chapter 2 !
    --------------------------------------------

   This one is a bit more complex but still 'Easy'
   In order to keep it at this level i'll provide just
   a bit of help.

   Each step will be in a self contained function.
   I may have a few helper functions here and there
   but nothing big. I hate difficult easy challenge
   as much as you do.

   The first step is in this main function.

   If you completed the previous chapter, this 1st step should be easy to guess =^_^=

   Once you completed this main step, you can directly skil to step2 using './adventure2 2'... probably :D
   You can (try to) cheat and skip the main step entirely but what's the point then ?
    Good luck ! <3

--
ker2x
:wq


(Press enter to continue)

```

Well here is a nice little readme from the author. Catch the `:wq` at the end!
I guess we have another vim user here!
Okay, so what I got out of that is that the `main` function holds all of part
one, then part two is in a helper function. Also, we are told that there is an
argument that allows us to go to the next step to skip all the inputs in this one.

Press enter and continue:

```bash
* Previously in Chapter 1 :
---------------------------

  - After being summoned from another world, you went to the guild hall
  - You met the security guard and didn't die
  - You entered the guild hall and didn't die
  - Then you reached the registration office
    and maybe died a few times. But you're a hero
    from another world so it's fine =^_^=

* Chapter 2, the registration office.
-------------------------------------

* The receptionist notice you coming directly to her :
"Heeeelp ! KILL ! KILL ! KILL !"
(-0HP)

(Press enter to continue)

```

Lets try hitting enter again... well that didn't work.

```bash
(- 1000HP)
Segmentation fault
```

```note
By the way, I had to switch to bash (instead of zsh) to get the right output for
the segfault, for some reason zsh really didn't like it and crashes, atleast on
my end.
```

Seems we need a different input here instead of enter, maybe that is what `ker2x`
was talkin about with "misguiding" in the README.txt he gave us. I tried an `ltrace`
but this didn't help or even give any pointers other than that this binary is using
`getchar` to take input. Let's open this up in radare2 and take a look:
Scrolling past all the excess strings and puts/printf's etc, getting to the part we
need to look at, there is some manipulation after that second `getchar`:

```nasm
0x55e90be00af8   lea rdi, str._Heeeelp___KILL___KILL___KILL____n__0HP__n ; 0x55e90be01620 ; "\"Heeeelp ! KILL ! KILL ! KILL !\"\n(-0HP)\n" ; const char *s
0x55e90be00aff   call sym.imp.puts       ; int puts(const char *s)
0x55e90be00b04   lea rdi, str._Press_enter_to_continue_ ; 0x55e90be013ff ; "(Press enter to continue)" ; const char *s
0x55e90be00b0b   call sym.imp.puts       ; int puts(const char *s)
0x55e90be00b10   call sym.imp.getchar    ; int getchar(void)
0x55e90be00b15   mov dword [rbp - 0xb4], eax
0x55e90be00b1b   mov rax, qword [rbp - 0xb0]
0x55e90be00b22   movzx eax, byte [rax]
0x55e90be00b25   movsx eax, al
0x55e90be00b28   add eax, 1
0x55e90be00b2b   cmp dword [rbp - 0xb4], eax
0x55e90be00b31 b je 0x55e90be00b58
```

As you can see by the `b` I set a breakpoint at `0x55e90be00b31` and will use `dc`
to get to it (`dc`: debug continue - continues program till breakpoint). After
continuing to this breakpoint, lets read where we need to check. So we see in the
`cmp` (line `0x55e90be00b2b`) that the variable `rbp-0xb4` (which is `var_b4h`
defined above) gets compared with eax (which we can check):

```bash
:>  ? eax ~string,hex
hex     0x48
string  "H"
```

Interesting, it is `'H'` after the manipulation. Remember how to see our variables?
Yep, `afvd`! Let's check `var_b4h` and see if our input gets manipulated too.

```bash
:> afvd~var_b4h
var var_b4h = 0x7ffc3983f71c = 10
```

```tip
If you noticed the `~` in my commands, this is the built in `GREP` in radare2
believe it or not, in the example above `? eax ~string,hex` the comma is
an OR, so it greps for "string" or "hex".
```

Okay! So our input does not get manipulated which makes this very easy. If you 
noticed the `10` (0x0a) there, that is the [ASCII](http://www.asciitable.com/)
value for LF (Line Feed) which is essentially like a newline, and that is what
should be expected since we gave the input a newline (Enter Key). Let's try
using an `H` instead of enter there:

```bash
❱ ./adventure2
(Press enter to continue)
H
"Wait !"

```

Check that out! It worked! Now we have to do the same thing 4 more times haha!
Let's look at the next block and set a breakpoint at `0x5585b5600bae` and continue
to it with `dc` (Press any key to test when prompted).

```nasm
0x5585b5600b58   lea rdi, str._Wait___   ; 0x5585b5601654 ; "\"Wait !\"" ; const char *s
0x5585b5600b5f   call sym.imp.puts       ; int puts(const char *s)
0x5585b5600b64   add qword [rbp - 0xb0], 1
0x5585b5600b6c   call sym.imp.getchar    ; int getchar(void)
0x5585b5600b71   mov dword [rbp - 0xb4], eax
0x5585b5600b77   call sym.imp.getchar    ; int getchar(void)
0x5585b5600b7c   mov dword [rbp - 0xb4], eax
0x5585b5600b82   mov rax, qword [rbp - 0xb0]
; DATA XREF from sym.step2 @ 0x5585b5600e29
0x5585b5600b89   add rax, 1
0x5585b5600b8d   mov qword [rbp - 0x98], rax
0x5585b5600b94   mov rax, qword [rbp - 0x98]
0x5585b5600b9b   sub rax, 1
0x5585b5600b9f   movzx eax, byte [rax]
0x5585b5600ba2   movsx eax, al
0x5585b5600ba5   add eax, 1
0x5585b5600ba8   cmp dword [rbp - 0xb4], eax
;-- rip:
0x5585b5600bae b je 0x5585b5600bd5
```

Again `eax` is being compared with `var_b4h` (our input). Now that we hit the breakpoint
we can check what `eax` is:

```bash
:> ? eax ~string,hex
hex     0x65
string  "e"
```

Well this is obviously spelling out a word, let's try `e` after doing `H` in a separate
instance:

```bash
❱ ./adventure2
...
(Press enter to continue)
H
"Wait !"
e
- It's trying to say something ...
- it's a he ? Kawaiiii~~~~ =^_^=

(- 3000HP)
Segmentation fault
```

Okay, I think you guys can figure the rest out on your own for the next 3 letters, either
the debugging route, or just guessing...

##### Tip

To restart debugging in radare2, you can use the `ood` or `doo` commands to "re-open for
debugging" essentially. These can also take flags as arguments, e.g: `ood test` would
re-open the program passing in the `test` argument.


### Solution

I hope you could find the next three letters on your own but this wouldn't be a valid
solution without having them here. Try doing it on your own though and see if you can
get the same ones I did!

```bash
(Press enter to continue)
H
"Wait !"
e
- It's trying to say something ...
- it's a he ? Kawaiiii~~~~ =^_^=
l
"Yes ! you can do it !!"
l
- huh ? you come from the deep underground ?
- Should we report it to the church ? Followers of Hades are punished by the holy church ... or so i'm told
- Not that we're followers, we're the free guild... free as in free beer ! Or
was it free speech ?
- Mmmm... what do we do ? what do we do ?
o
"Oooooooooo ! Socially approriate greetings !
"So you're not a monster after all ! Sorry sorry !"
(Press enter to continue... probably...)

```

Yep it is `Hello`! The little story lines to go along with it as you figure out
the letters is pretty hilarious, not gonna lie lol!

After that hit enter two times (read the dissassembly, there are no checks for those)
and you are now on the second step!!

## Part Two

So remember earlier we were told that the first step all happens really in the `main`
function? Well now we are in `sym.step2` function so on to step 2! 

### Getting the Shortcut Key

First, there is a little part in the beginning of dissassembly that checks for a
valid argument. If you get it completely wrong:

```bash
❱ ./adventure2 test
NOPE!
Segmentation fault
```

The logic is a little tricky so I provided some pictures of the flow to clear it up:

![Pic1](https://i.imgur.com/0RYRzMM.png)

![Pic2](https://i.imgur.com/oUamSZP.png)

---

## Closing

Hope you enjoyed this writeup, it isn't much partly because the crackme itself
wasn't much but atleast we did it! This one was super fun because it's a story
and stories make everything better!
Thanks for reading and have a blessed day!
Shado out.

