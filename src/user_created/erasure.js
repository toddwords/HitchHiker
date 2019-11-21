function erase(letters){
 var textnodes = getTextNodes();
 var findRE = new RegExp(letters, "gi")
 for (var i = 0; i < textnodes.length; i++) {
   var text = textnodes[i].nodeValue;
   textnodes[i].nodeValue = text.replace(findRE, "");
 }
}


function getTextNodes() {
 // get all html elements
 var elements = document.querySelectorAll("body, body *");
 var results = [];


 //loop through the elements children nodes
 for (var i = 0; i < elements.length; i++) {
   var child = elements[i].childNodes[0];

   // grab everything that's a textNode (nodeType is "3")
   if (elements[i].hasChildNodes() && child.nodeType == 3) {
     results.push(child);
   }
 }

 return results;
}