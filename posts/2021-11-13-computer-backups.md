---
title: Computer backups
description:
date: 2021-11-13
tags:
  - computer
layout: layouts/post.njk
---

### Neglect

I saw the topic of backups come up again on Hacker News. A couple years ago I set up both Duplicacy
and Restic. I was going to run both and then compare them. Instead of setting up a schedule I would
run a script to kick off the backups. I don't remember the details but I found Duplicacy easier to
keep up with so I dropped running Restic fairly quick. I don't remember how long I kept up with the
backups run by Duplicacy but it fail by the wayside at some point. At this point I don't even
remember how I was running them. Considering all of this of course I decided to start all over. This
time I decided to try [Kopia][], foolishly believing a new tool will of course fix my issues of
neglecting backups.

### Getting started

Installation was simple in Arch: `yay -S kopia`. There are a number of go modules which are
downloaded. I did not see a package for the KopiaUI which was disappointing because I was going for
easy. But the CLI is preferable anyway.

I followed their Getting Started guide. The first example is using the file system. Probably the
simplest use case, so let's try it.

```
kopia repository create filesystem --path /home/my-user/kopia-backup
kopia snapshot create ~/Documents
```

It prompted for a password when creating the repository and then quickly created the snapshot.
Simple indeed. Let's take a look at the snapshot.

```
kopia snapshot list
```

### Policies

I think I want to change some of those policies, like which files to ignore. Let's take a look at
the current default policies.

```
kopia policy show --global
```

First up, lets ignore some directories.

```
kopia policy set --add-ignore .node_modules/ --global
kopia policy set --add-ignore .git/ --global
kopia policy show --global
```

Excellent! I'm was thinking about changing the retention policies but perhaps it's better to keep
the defaults for now, at least on the file system repository. But for reference the command to
change the policy is simple to use.

```
kopia policy set --keep-monthly 10 --global
```

My preference is to use compression though. Maybe not so important for the file system repository
but a feature it will be helpful to try out, hopefully it will help verify I won't have issues
running it on other repositories. The documentation recommends running a benchmark to help determine
which algorithm to use. I tried running the benchmark on a couple files.

```
kopia benchmark compression --data-file=book.pdf
kopia benchmark compression --data-file=data.csv
```

Not much difference in the algorithms for those files. And unsurprisingly it didn't help the PDF.
The CSV isn't very large so not much benefit there either. Oh well, I'll still turn it on and pick
an algorithm.

```
kopia policy set --compression=pgzip --global
```

After enabling it and creating a new snapshot you can view the stats of the snapshot.

```
kopia content stats
```

> compression 1.3%

### Scheduling 📅

Okay, well let's put the backups on a schedule so they don't get neglected this time. On Arch one
option is to use `systemd-run` to run jobs. I'll create a little script to run all snapshots.

```
echo '#!/bin/sh\nkopia snapshot create --all' >> ~/.bin/kopia-backup.sh
chmod +x ~/.bin/kopia-backup.sh
```

Then I'll add an entry to run the script hourly.

```
sudo systemd-run --on-calendar=hourly ~/.bin/kopia-backup.sh
systemctl list-timers
```

### Backblaze

I have an old Backblaze bucket I was using for backups. I'll repurpose it for the Kopia backups.
I'll use environment variables for the Backblaze bucket ID and Key so I can store them elsewhere.

```
export B2_KEY_ID=MY-APPLICATION-ID
export B2_KEY=MY-APPLICATION-KEY
kopia repository create b2 --bucket=tCarbon
```

Policies do need to be set up for this repository as well.

```
kopia policy set --add-ignore .node_modules/ --global
kopia policy set --add-ignore .git/ --global
kopia policy set --compression=pgzip --global
```

Great! And now we can start creating snapshots for this repository.

```
kopia snapshot create ~/Documents
```

### Switching repositories

You need to switch back and forth between repositories when creating snapshots. This seems like it
could be a stumbling stone when trying to schedule backups and using multiple repositories. Anyway,
the command to switch back and forth is the same as the initial command when creating the repository
except the command is `connect` instead of `create`.

```
kopia repository connect filesystem --path /home/ciwchris/kopia-backup
kopia repository connect b2 --bucket=tCarbon
```

That's it for now. Happy backups! 🤞

[Kopia]: https://kopia.io/

