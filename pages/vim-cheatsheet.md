---
layout: layouts/page.njk
title: Vim Cheatsheet
templateClass: tmpl-page
date: 2020-01-01
---

### Command mode

- `ctrl+f` in command mode shows the command history. You can edit them and hit enter to execute one
- `r! cmd` write output of cmd in buffer
- `:g/useless/norm gu$` lowercase every line containing the word 'useless'
- `:sort /[^,]*,/` sort by second column in CSV (character following the comma)
- `:bufdo <cmd>` apply cmd to all buffers
- `:imap` to see what is mapped in insert mode
- `:set <option>!` toggle option
- `:set <option>?` see option value


### Insert mode

- diagraphs: insert with `ctrl-k` followed by:
    - ✗ xx
    - ✓ OK
    - → ->
- `ctrl-t` and `ctrl-d` to indent and de-indent
- `ctrl-o` enter normal mode for one keystroke
- `ctrl-g u` break undo history here and start new history

### Normal mode

- `ga` to see info about the character under the cursor
- `gx` open the file/URI under the cursor using default program
- `"%p` paste current name of file
- `":p` paste last command
- `"/p` paste last search
- `ctrl-w x` exchange with the next window
- `g;` and `g,` to go forward and backward in the change list


### Visual mode

- `$A` in block mode appends to the end of each line
- `g ctrl+a` increment each number sequentially

### Plugins

- [winresizer](https://github.com/simeji/winresizer)
  - `ctrl-e` to enter resize/move/focus mode. `h`, `j`, `k`, `l` to move.
- [vim-bbye](https://github.com/moll/vim-bbye)
  - `:Bd` or `Bw` to remove buffer but keep window
- [luochen1990/rainbow](https://github.com/luochen1990/rainbow)
  - `:RainbowToggle` to turn on and off
- [dpelle/vim-LanguageTool](https://github.com/dpelle/vim-LanguageTool)
  - `:LanguageToolCheck` to check buffer
  - `:LanguageToolClear` clear the buffer
  - `:lne` next message
- [junegunn/fzf.vim](https://github.com/junegunn/fzf.vim)
  - `:Files [PATH]` Files (runs $FZF_DEFAULT_COMMAND if defined)
  - `:GFiles [OPTS]` Git files (git ls-files)
  - `:GFiles?` Git files (git status)
  - `:Buffers` Open buffers
  - `:Marks` Marks
  - `:Windows` Windows
  - `:Locate PATTERN` locate command output
  - `:History` v:oldfiles and open buffers
  - `:History:` Command history
  - `:History/` Search history
  - `:Helptags` Help tags
