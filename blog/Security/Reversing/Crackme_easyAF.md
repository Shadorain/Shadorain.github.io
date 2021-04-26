---
layout: default
title: "Crackme - easyAF"
nav_order: 1
permalink: /blog/Security/Reversing/Crackme_easyAF
parent: Reversing
grand_parent: Security
has_children: false
---

# EasyAF - Crackme Writeup

Author: 476f64 | Level: 1.0 | Quality: 4.0 | Platform: Unix/Linux | Language: C/C++

This crackme has been provided by [crackmes.one](https://crackmes.one).  
Get it here: [Link](http://crackmes.one/crackme/5eae2d6633c5d47611746500)

## Introduction

For all my solutions, I will use radare2: a fantastic terminal user interface
reversing tool that amazes me daily on its immense potential. So when I use a
`:> ` it is a radare2 shell command (from Visual modes you can get to this via
the `:` key just like in vim). When I use `$> ` it is referring to a normal shell
command. With that out of the way let's get to the meat of it!

---

## Solution

Reading the dissassembly of this code was horrendous lol, killed my eyes to have
to read the extraordinarily large function call lines etc, and for a minite it 
was even slightly intimidating honestly. Getting to the actual program meat though
was simple. Didn't have to debug or anything, hardly had to read much assembly
either. Found a string `"pass"` and found that it gets stored into a string
then some other things happen but in the end of the block, the input string is
tested against `"pass"` and we get our win.

```bash
❱ ./easyAF
Welldone!
```

Well that wasnt too hard, could have done that even simpler with a `strings` or
similar. But we got it! We got the flag and solution.

---

## Closing

Hope you enjoyed this writeup, it isn't much partly because the crackme itself
wasn't much but atleast we did it! Thanks for reading and have a blessed day!
Shado out.
