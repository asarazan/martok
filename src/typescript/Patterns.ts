/**
 * Conventions suck, but if you want an easy way to identify date strings in your schemas, this is a pretty good one.
 * The transpiler will recognize numbers as epoch timestamps, and strings as ISO timestamps.
 * Enable this functionality with {TODO}
 * @match utcFoo;
 * @match isoBar;
 * @match bazDate;
 */
export const StandardDatePattern = /((^(utc|iso)\w*$)|(Date$))/;
