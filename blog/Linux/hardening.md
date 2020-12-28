---
layout: default
title: Hardening Linux
nav_order: 5
parent: Linux
has_children: true
---

# Hardening Linux
{: .no_toc }
##### In this post we take a look at:
{: .no_toc }

<dl>
    <dt>Userspace</dt>
    <dd><a href="#apparmor">AppArmor</a></dd>
    <dd><a href="#firejail">FireJail</a></dd>
    <dd><a href="#rkhunter">RKHunter</a></dd>
    <dt>Kernel</dt>
    <dd><a href="#patches">Custom Security Patches</a></dd>
    <dt>Network</dt>
    <dd><a href="#firewall">Firewall and new DNS</a></dd>
</dl>
{: .no_toc }

---

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### Userspace
**The userspace is where all our typical applications will run on our machine, so we definitely need to implement security here.**
There are two FOSS (Free and Open Source) pieces of software that I believe are at the top of the list past SELinux for what we need:
- AppArmor
- FireJail
```note
To install these, check in your repo what their package names are. On XBPS (Void Linux) they are simply `apparmor` and `firejail`.
```

#### Apparmor
{:.no_toc}
AppArmor is quite self explanatory to set up quite frankly, and honestly the defaults are all you need for a desktop system.
Let's first check if it is enabled:
```bash
❱ sudo aa-enabled
Yes
```

> If you get an error here then good that just means we have to set it up. If you get Yes, then you can skip this section.

First, we have to send some commands to our kernel, the simplest way to do this is via GRUB, if you use a different bootloader skip to [Different Bootloader](#different-bootloader).

###### GRUB
{:.no_toc}
```tip
Use your editor of choice, I prefer and recommend Neovim which is aliased to `vim` on my system, which I will use throughout all blogposts.
```
To edit our grub kernel commandline, we must go into `/etc/default/grub`

```bash
❱ sudo vim /etc/default/grub
```

Find, the line with `GRUB_CMDLINE_LINUX_DEFAULT` and at the end we need to add two parameters, `apparmor=1` and `security=apparmor`.

Here is how my `/etc/default/grub` file looks. Take note of the last two parameters of `GRUB_CMDLINE_LINUX_DEFAULT`.

```bash
#
# Configuration file for GRUB.
#
GRUB_DEFAULT=0
#GRUB_HIDDEN_TIMEOUT=0
#GRUB_HIDDEN_TIMEOUT_QUIET=false
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR="Void"
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=4 slub_debug=P page_poison=1 net.ifnames=0 apparmor=1 security=apparmor"
# Uncomment to use basic console
#GRUB_TERMINAL_INPUT="console"
# Uncomment to disable graphical terminal
#GRUB_TERMINAL_OUTPUT=console
#GRUB_BACKGROUND=/usr/share/void-artwork/splash.png
#GRUB_GFXMODE=1920x1080x32
#GRUB_DISABLE_LINUX_UUID=true
#GRUB_DISABLE_RECOVERY=true
# Uncomment and set to the desired menu colors.  Used by normal and wallpaper
# modes only.  Entries specified as foreground/background.
#GRUB_COLOR_NORMAL="light-blue/black"
#GRUB_COLOR_HIGHLIGHT="light-cyan/blue"
```

```bash
❱ sudo update-grub
❱ sudo shutdown -r now
```
This will enable the AppArmor module in the kernel from the GRUB bootloader commandline.

###### Different Bootloader
{:.no_toc}
There are quite a large number of bootloader's out there so I will only cover grub here in how to do it, but the options are the same.

Here is a [link](https://wiki.archlinux.org/index.php/Kernel_parameters) on how to send commands to the kernel from different bootloaders. The commands required for AppArmor to run and function are: `apparmor=1` and `security=apparmor`

##### Enable and Enforce
{:.no_toc}
Now that we have allowed AppArmor from the kernel, its time to Enable and Enforce!

```bash
❱ sudo aa-enforce /etc/apparmor.d/*
```
This command employs all the default AppArmor settings that are set in `/etc/apparmor.d/`.

> This is an important directory to keep in mind because if there is not a default configuration file for a specific application,
then you will need to make your own to begin enforcement of any policies on that specific application.

Finally, it is time to set AppArmor to enforce policies.
```bash
❱ sudo vim /etc/default/apparmor
```
Edit the file to look like this: (note you do not need the comments, just the final line)
```bash
# AppArmor configuration

# Possible options:
# - disable
# - complain
# - enforce
APPARMOR=enforce
```
Save and exit (`ESC :wq`)

##### Finish up
{:.no_toc}
Finally all you have to do is first, reboot your system.
```bash
❱ sudo shutdown -r now
```
During the bootup process watch closely before it displays the login tty or display manager.
If setup correctly, there should have been some apparmor messages.

But this isn't a reliable way of checking, here are two ways (advice using both) to check if it is running and enforcing policies:
- `❱ sudo aa-enabled` If this displays `Yes` then it is active, but this isn't enough...
- `❱ sudo apparmor_status | less` If this displays a whole list of programs then you are all set!

Congratulations, you now have AppArmor installed into your kernel and enforcing security policies on your system. Not so hard after all! There is definitely a lot more too it though so be sure to go through `/etc/apparmor.d/` and add your own application configs.

#### FireJail
{:.no_toc}
*Firejail* is a program that essentially **sandboxes** any program that is run with it which means that the program can only access directly what it needs and nothing else. This is an effective security measure because if an attacker for example is able to exploit your web browser or a page, they cannot go very far because the browser itself is locked to only it's needed files.

*FireJail* is simple to start using, but there is a lot more to it past what this post will cover. First, install it from your repo ([see above](#userspace)).

```bash
❱ firejail --seccomp --nonewprivs --private-tmp <program>
```
This honestly is the only command I use and it has done a good job so far. In my window manager (xmonad) I have this line prepended in every keybind that opens any program, including my terminal, browser, dmenu, everything. 

I yet have noticed any performance issues, everything has run smooth and without errors. The only programs I believe this could cause malfunction would be those that dynamically call to different libraries or similar. Give this one a good tryout though, definitely think it to be quite helpful in adding another layer of security.

#### RKHunter
{:.no_toc}
*RKHunter* stands for RootKit Hunter, and this is an incredible tool that looks for any signs of rootkit infections on your system.
```danger
A RootKit is a form of malware that gives an attacker continued escalated priviledge access to a computer. These are extremely dangerous and can give the attacker access to everything.
```
Install this from your repo, the package name should simply be `rkhunter`, if not, try `rootkit-hunter`.
First, before anything else, make sure to update our rkhunter *properties database*.
```bash
❱ rkhunter --propupd
```
Now we can run the check on our system.
```bash
❱ rkhunter --check
```
This will wait for user interaction every few lines to make sure that nothing is missed from it. Be sure to watch the right line for any "Warning" or "Dangerous" signs.

Once the check is complete, if there were any suspicious binaries we can look in the log file to see more information:
```bash
❱ sudo cat /var/log/rkhunter.log | less
```

Lastly, to quelch any false Warnings (egrep, fgrep, ldd, and some others) simply set them to be whitelisted in our rkhunter config:
```bash
❱ sudo vim /etc/rkhunter.conf
```
Add these lines to whitelist:
```bash
SCRIPTWHITELIST=/usr/bin/egrep
SCRIPTWHITELIST=/usr/bin/fgrep
SCRIPTWHITELIST=/usr/bin/ldd
```
These are false positives because after the base system has been installed, these binaries are swapped with scripts which sengs a flag to rkhunter, but these are not malicious, unless...

*RKHunter* is a simple and very powerful tool to keep a watchful eye on various system binaries. Be sure to use it after installing anything that just didn't seem fully trust worthy.


### Network
#### Reconfigure DNS
{:.no_toc}
I personally trust Cloudflare to set my DNS to the most. They run `nginx` for their server which is under a *BSD* Liscence, and they promote Free Software alot. On top of this though, their network practically acts like a large VPN, and come with some nice security protocols as well, some being a Firewall and DDOS protection.

Let's set it here:
```bash
❱ sudo vim /etc/resolv.conf
```

Depening, your file should be pretty minimal, edit `nameserver <ip>` to `nameserver 1.1.1.1` (Cloudflares IP).
Your file should look similar to:
```bash
search fios-router.home
nameserver 1.1.1.1
```

```warning
If you use NetworkManager, you will need to configure it to not reconfigure your 'resolv.conf' on reboot. To do this, add the line `dns=none` under [main] in /etc/NetworkManager/NetworkManager.conf
```

#### Setup UFW Firewall
{:.no_toc}
`ufw` is an awesome tool. It stands for "uncomplicated firewall" because for real, it isn't that complicated, but there is a load of great features and tools with it.

Again, install it from your repo ([see above](#userspace)). And its time to turn off everything so be prepared to not have any connection!

First, find what your network interface is, I set it to a variable here so that you can simply copy and paste the later commands:
```bash
❱ ip link   # If wireless, your card may look like i.e. `wlan0` or `wlp0s20f3` 
            # If ethernet, your card may look like i.e. `eth0` or `elp0s20f3`
❱ MY_INTERFACE=wlan0    # put your interface instead of `wlan0`
```

To enable `ufw` run:
```bash
❱ sudo ufw enable
```

Here we disallow all traffic, nothing in nothing out:
```bash
❱ sudo ufw default deny incoming
❱ sudo ufw default deny forwarding
❱ sudo ufw default deny outgoing
```

Next, we obviously don't want to be completely locked away from the internet, so we set some openings:
```bash
❱ sudo ufw allow out on $MY_INTERFACE to 1.1.1.1 proto udp port 53 comment 'Allows dns on interface'
❱ sudo ufw allow out on $MY_INTERFACE to any proto tcp port 80 comment 'Allows HTTP on interface'
❱ sudo ufw allow out on $MY_INTERFACE to any proto tcp port 443 comment 'Allows HTTPS on interface'
```
- We allow only traffic through our current DNS which is Cloudflare in this case (1.1.1.1) on port UDP:53.
- Then allow all HTTP and HTTPS traffic on TCP:80 and TCP:443.
- These only apply to our current interface as well, the others are still locked down.
- Should now be able to go to a webpage.

Finally, we need to enable the `ufw` service to start at startup:
```bash
# This command only works with the Runit Init System
❱ sudo ln -s /etc/sv/ufw /var/service   # enables at startup
❱ sudo sv up ufw    # starts service now
```

If you run *systemd* the command will be along the lines of:
```bash
❱ sudo systemctl enable ufw     # enables at startup
❱ sudo systemctl start ufw      # starts service now
```

There you have it, your *uncomplicated firewall* is now setup and enabled at startup. There are many more configuration options, but this is plenty enough for the casual desktop user.

### Kernel
Not yet done myself! Coming soon...
