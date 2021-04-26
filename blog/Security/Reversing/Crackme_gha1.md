---
layout: default
title: "Crackme - Guild Hall Adventure Ch.1"
nav_order: 1
permalink: /blog/Security/Reversing/Crackme_gha1
parent: Reversing
grand_parent: Security
has_children: false
---

# Guild Hall Adventure Ch. 1 - Crackme Writeup

Author: ker2x | Level: 1.0 | Quality: 4.0 | Platform: Unix/Linux | Language: C/C++

This crackme has been provided by [crackmes.one](https://crackmes.one).  
Get it here: [Link](http://crackmes.one/crackme/5d0fa1ac33c5d41c6d56e172)

## Introduction

For all my solutions, I will use radare2: a fantastic terminal user interface
reversing tool that amazes me daily on its immense potential (with a few other
needed tools mixed in). So when I use a `:> ` it is a radare2 shell command (from
Visual modes you can get to this via the `:` key just like in vim). When I use
`$> ` it is referring to a normal shell command. With that out of the way let's
get to the meat of it!

---

## Part One

Lets open this binary and see what it does without any arguments or anything:

```bash
❱ ./adventure
Woaaa ! what about being polite ? huh ?
```

That is quite a big hint, doesn't seem like it gives any input for us to type to
so why not try some arguments!:

```bash
❱ ./adventure hi
no no no ! it's not a socially appropriate greeting !
```

Okay, so we know we need an argument but don't know what yet. `strings` gives us
our first key but I'd like to show that ltrace can as well:

```bash
❱ ltrace ./adventure hi
strlen("hi")                                                                     = 2
puts("no no no ! it's not a socially a"...no no no ! it's not a socially appropriate greeting !
)                                      = 54
+++ exited (status 254) +++

❱ ltrace ./adventure hiiii
strlen("hiiii")                                                                  = 5
strncmp("hiiii", "hello", 5)                                                     = 4
puts("no no no ! it's not a socially a"...no no no ! it's not a socially appropriate greeting !
)                                      = 54
+++ exited (status 254) +++
```

Check it out, so our program was looking for a strlen of 5 to then run a `strcmp`
on. Pseudo code:

```c
if (strlen(5)) {
    if (strcmp("hello", argv[1], 5))
        puts("Friendly greetings to you, hacker from another world !");
    else {
        puts("no no no ! it's not a socially appropriate greeting !");
        exit(0);
    }
} else {
    puts("no no no ! it's not a socially appropriate greeting !");
    exit(0);
}
```

So we test `hello` as our argument and are on to [part two](#part-two)!

## Part Two

```bash
 ❱ ./adventure hello
Friendly greetings to you, hacker from another world !
So, why are you here ? :
```

Sweet, we get an input here! Try something random!

```bash
So, why are you here ? : absolutely no idea
absolutely ?  This is the guild hall, i can't let you in, sorry, i need to kill you now. Byyye~~~
zsh: segmentation fault  ./adventure hello
```

Honestly, I can't tell you why it segfaults here, most likely has to do with my shell
and prob would be fine on any other one. Time to try `ltrace` again, remember to pass
the argument in as well!:

```bash
❱ ltrace ./adventure hello
strlen("hello")                                                                  = 5
strncmp("hello", "hello", 5)                                                     = 0
puts("Friendly greetings to you, hacke"...Friendly greetings to you, hacker from another world !
)                                      = 55
printf("So, why are you here ? : ")                                              = 25
__isoc99_scanf(0x564c57a00a89, 0x7ffc2c3e4c80, 0, 0So, why are you here ? : idk
)                             = 1
printf("%s ?  ", "idk")                                                          = 7
strlen("idk")                                                                    = 3
strncmp("./adventure", "idk", 3)                                                 = -59
puts("This is the guild hall, i can't "...idk ?  This is the guild hall, i can't let you in, sorry, i need to kill you now. Byyye~~~
)                                      = 84
--- SIGSEGV (Segmentation fault) ---
+++ killed by SIGSEGV +++
```

Welp, look closely, we have our answer (check the `strcmp` ;) ) `./adventure`. Simple
enough, but does it work?!

```bash
❱ ./adventure hello
Friendly greetings to you, hacker from another world !
So, why are you here ? : ./adventure
./adventure ?  good, good, welcome to the guild hall!
```

Heck yeh it does!! We have recovered the flag and now successfully entered the guild
as warriors! Wonder where else this adventure will take us! ;)

### Comment

I checked the disassembly pretty intently to make sure there was nothing extra to this
challenge. If you can remember the [crackme not main](/blog/Security/Reversing/Crackme_CNM) challenge... you would know why
I am doing this lol.

---

## Closing

Hope you enjoyed this writeup, it isn't much partly because the crackme itself
wasn't much but atleast we did it! This one was super fun because it's a story
and stories make everything better!
Thanks for reading and have a blessed day!
Shado out.
