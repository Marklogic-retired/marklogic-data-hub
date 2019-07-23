/*
  Copyright 2012-2019 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

function parseDateTime(picture, value) {
    let supportedFormats = ["YYYYMMDDThhmmss", "DD/MM/YYYY-hh:mm:ss", "DD/MM/YYYY hh:mm:ss", "YYYY/MM/DD-hh:mm:ss" , "YYYY/MM/DD hh:mm:ss"];
    let response;
    if(supportedFormats.includes(picture.trim())){
        try {
            response = xdmp.parseYymmdd(picture.replace("YYYY","yyyy").replace("DD","dd"), value);
        }
        catch(ex){
            fn.error(null, ex.message);
        }
    }
    else{
        fn.error(null, "The given dateTime pattern (" + picture + ") is not supported.");
    }
    return response;
}

module.exports = {
  parseDateTime: parseDateTime
};
