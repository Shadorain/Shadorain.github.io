HTB Challenge :: Mobile : Cat
===============================

So to start, lets read our small hint for this challenge: "Easy leaks", nevermind
that isn't helpful haha! Let's just unzip the file we are given:
On Linux - `unzip Cat.zip`. This extracts a file called `cat.ab` onto our system.
Let's try running `file` on it... `cat.ab: Android Backup, version 5, Compressed,
Not-Encrypted`. Usually file can only help us if the file has a specific header
(with a magic number) that tells what type and info the file has. This file is an
Androis backup file! This may help us later in our research.

Why not try Googling then! Looked up how to extract an ab file and found a very
helpful [stackoverflow link](https://stackoverflow.com/questions/18533567/how-to-extract-or-unpack-an-ab-file-android-backup-file)
scroll down a bit and there it is! The command to extract our Android backup file!

```bash
( printf "\x1f\x8b\x08\x00\x00\x00\x00\x00" ; tail -c +25 cat.ab ) |  tar xfvz -
```

Running this on our file, it ends in an error (a comment in stack tells how to
get past the error), but that doesn't matter since we've already extracted enough.
Extracting was verbose so you should see that it generated some directories,
immediately `shared/0/Pictures/` caught my eye! There were some pictures in there
why not just check them out! Looking through each picture it seems as if they are
seemingly normal (just cat pictures) but then I found it! Checkout `IMAG0004.jpg`!
A good tool on linux that I absolutely adore is called `sxiv` created by the
wonderful Suckless Developers, and sxiv lets you zoom in as far as you want, and
looking closely at the paper the mystery man was holding, it said Top Secret as the
title (already suspicious) and at the bottom we see our flag!!! We did it! Solved
this simple mobile challenge.

Pop the flag into the box and get those swell twenty points baby!
