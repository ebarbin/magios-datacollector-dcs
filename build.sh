#!/bin/bash

echo "Building programs for all servers"

pkg magios-datacollector-dcs.js --targets node10-win-x64 -o magios-datacollector-dcs.exe
'C:\Program Files\WinRAR\'Rar.exe a magios-datacollector-dcs1.rar magios-datacollector-dcs.exe

sed -i 's+const SERVER_ID = 1;+const SERVER_ID = 2;+g' magios-datacollector-dcs.js

pkg magios-datacollector-dcs.js --targets node10-win-x64 -o magios-datacollector-dcs.exe
'C:\Program Files\WinRAR\'Rar.exe a magios-datacollector-dcs2.rar magios-datacollector-dcs.exe

sed -i 's+const SERVER_ID = 2;+const SERVER_ID = 3;+g' magios-datacollector-dcs.js


pkg magios-datacollector-dcs.js --targets node10-win-x64 -o magios-datacollector-dcs.exe
'C:\Program Files\WinRAR\'Rar.exe a magios-datacollector-dcs3.rar magios-datacollector-dcs.exe

sed -i 's+const SERVER_ID = 3;+const SERVER_ID = 1;+g' magios-datacollector-dcs.js