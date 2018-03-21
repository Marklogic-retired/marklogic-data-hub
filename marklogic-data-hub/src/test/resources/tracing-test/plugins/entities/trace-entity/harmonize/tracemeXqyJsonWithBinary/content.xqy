xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Create Content Plugin
 :
 : @param $id          - the identifier returned by the collector
 : @param $options     - a map containing options. Options are sent from Java
 :
 : @return - your transformed content
 :)
declare function plugin:create-content(
  $id as xs:string,
  $options as map:map) as node()?
{
  binary { xs:hexBinary(xs:base64Binary("iVBORw0KGgoAAAANSUhEUgAAAA0AAAATCAYAAABLN4eXAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oIEQEjMtAYogQAAAKvSURBVCjPlZLLbhxFAEVPVVdXVz/G8zCOn0CsKGyQkSIIKzas8xfsWbLkp/gJhCKheIlAJDaj2MYez6u7p7vrxQKUPVc6+yOdK77/4cfXQohJqlOVZdmBSpKY6jQKBM45oVMlgHvrvMuNWRljvlNKq69G2YyqLDg4mLE/2yPNYFRWlFXF/nTC2clRWbc7Fss1IcZzqTA8eWY5eu7p1Hv+WvyBVjnGZOQmI9UKISUqSXDO0bS7Tko0xfGSp18kjM7v+P3+NUMr8T5grWMYLCEErHM474khoCw1t78eU/8mEOpjXpxekJUORIZSCbkxSCnRWpPnBikTqbx31E1DjJHpeIzRhnW9xceI857H5Yr1Zku765jf3DIMtlUAIQRCiFhnabsOH1IEAmstAGWRY11ApykmM0oplTKZjNGZREpJoUueHI0ZFRV7exX7+1Nm0yn9YLm5u2fX96lUseLwxQ0vX8H04i2/XP9Et5H44OkHS920hBDo+56u77GDjcrHjvV1ya3TDO2M01mOUAEAhED+R5IkpKmCiFCOjoc/p+xuLbPpCc+P95HaEqIBIhHoB8t2W/PwsKBudl5FH7GxwUYYouJh5ci7nLbtWW02LBaPvLuef1AdrItKKolJpkivwGrG5QxTCsq8pCxLqqrk7PiIwTmW6y0xRCVTSg4vFnz+raM4+5ur1RtSUZHnOUWeMx5VVFWJTlOstfTWRuk96NIyOUgRRc188RZvgRg/3OffjoFESohxUMvmjqufP+X+MqDTU77+5EvMKKBUQpZpijxHSkluDHvjMW8uL79Rnz07bwSyzDLFqCzwDNw/PNI0O9bbhvVmQ7vb0bQdi+Wq327rl+rko8krodKnCHnofJju+r5oupBstg1KJT7Vuruev185O9zVm/WVUmouYoz83/0DxhRmafe2kasAAAAASUVORK5CYII=")) }
};
