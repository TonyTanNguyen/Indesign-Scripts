if (parseFloat(app.version) < 6)
main1();
else
app.doScript(main1, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Expand State Abbreviations");
function main1(){
    var doc =app.activeDocument;
    for (j=doc.pageItems.length-1;j>=0;j--){
        if(doc.pageItems[j].parentPage==null){
            doc.pageItems[j].remove()}}
    
    }
