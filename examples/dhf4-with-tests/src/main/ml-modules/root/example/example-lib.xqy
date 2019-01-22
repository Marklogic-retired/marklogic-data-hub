xquery version "1.0-ml";

module namespace example = "org:example";

declare function echo($str as xs:string) as xs:string
{
  "You said: " || $str
};
