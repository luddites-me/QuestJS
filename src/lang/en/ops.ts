// Save/load messages
export const Ops = {
  sl_dir_headings        : '<tr><th>Filename</th><th>Ver</th><th>Timestamp</th><th>Comment</th></tr>',
  sl_dir_msg             : 'Ver is the version of the game that was being played when saved. Loading a save game from a different version may or may not work. You can delete a file with the DEL command.',
  sl_no_filename         : 'Trying to save with no filename',
  spoken_on              : "Game mode is now 'spoken'. Type INTRO to hear the introductory text.",
  spoken_off             : "Game mode is now 'unspoken'.",
  mode_brief             : "Game mode is now 'brief'; no room descriptions (except with LOOK).",
  mode_terse             : "Game mode is now 'terse'; room descriptions only shown on first entering and with LOOK.",
  mode_verbose           : "Game mode is now 'verbose'; room descriptions shown every time you enter a room.",
  mode_silent_on         : 'Game is now in silent mode.',
  mode_silent_off        : 'Silent mode off.',
  transcript_already_on  : 'Transcript is already turned on.',
  transcript_already_off : 'Transcript is already turned off.',
  undo_disabled          : 'Sorry, UNDO is not enabled in this game.',
  undo_not_available     : 'There are no saved game-states to UNDO back to.',
  undo_done              : 'Undoing...',
  again_not_available    : 'There are no previous commands to repeat.',
  scores_not_implemented : 'Scores are not a part of this game.',
  restart_are_you_sure   : 'Do you really want to restart the game? {b:[Y/N]}',
  restart_no             : 'Restart cancelled',
  yes_regex              : /^(y|yes)$/i,
  game_over_html         : '<p>G<br/>A<br/>M<br/>E<br/>/<br/>O<br/>V<br/>E<br/>R</p>',
};