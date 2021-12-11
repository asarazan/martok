/**
 * Conventions suck, but if you want an easy way to identify date strings in your schemas, this is a pretty good one.
 * The transpiler will currently recognize ISO timestamp strings. Epoch numbers are still TODO
 * Enable this functionality with the -d flag.
 * @match utcFoo;
 * @match isoBar;
 * @match bazDate;
 */
export const StandardDatePattern = /((^(utc|iso)\w*$)|(Date$))/;
