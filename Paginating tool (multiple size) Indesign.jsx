#targetengine 'miscellaneous'


var doc = app.activeDocument
var page = app.activeDocument.pages
// excelpath = '/Users/tannguyen/Desktop/Tasks/Automation pagination/copy-academic.xlsx'




a = File.openDialog()

a.open('r')
data = a.read()

app.excelImportPreferences.tableFormatting = TableFormattingOptions.EXCEL_FORMATTED_TABLE
// alert(data.toSource())

dumTF = app.activeDocument.pages[0].textFrames.add({geometricBounds:[0,0,10000,10000]})

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT
dumTF.place(a)
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL

mytable = dumTF.tables[0]

var dataframe = []

for (row = 0; row < mytable.rows.length; row++){
	var activeRow = []
	for (c = 0; c < mytable.rows[row].cells.length; c++){

		activeRow.push(mytable.rows[row].cells[c].contents)
		

	}
	if(activeRow[0].length>1){
		dataframe.push(activeRow)
	}

}
dumTF.remove()

mycolumn = {}

colorlist = doc.swatches.everyItem().name
jpegQualityList = {
	'Maximum Quality': JPEGOptionsQuality.MAXIMUM,
	'High Quality' : JPEGOptionsQuality.HIGH,
	'Medium Quality' : JPEGOptionsQuality.MEDIUM,
	'Low Quality' : JPEGOptionsQuality.LOW,
}
jpegQualityDropdownList = ['Maximum Quality','High Quality','Medium Quality','Low Quality']

var w  = new Window('palette','TGM campaign auto generator')
	w.orientation = 'column'
	w.alignChildren = 'left'
	w.maximumSize.width = 700
	w.minimumSize.height = 200

	var panel = w.add('group')
		panel.orientation = 'column'

		var mainGroup = panel.add('group{alignChildren:"left"}')
		var scroll = panel.add('scrollbar{stepdelta:20}')
		scroll.onChanging = function (){
			mainGroup.location.x = -1*this.value
		}
	w.add('statictext',undefined,'Output name')
	outputName = w.add('dropdownlist',undefined,dataframe[0])
	var colName = ''
	outputName.selection=null
	outputName.onChange = function(){
		
		if(outputName.selection!=null){

			colName = mycolumn[outputName.selection.text]
		}

	}
	w.add('statictext',undefined,'Hightlight color')
	colorHightligh = w.add('dropdownlist',undefined,colorlist)
	w.add('statictext',undefined,'Output Subfolder')
	subFolder = w.add('edittext',undefined,'')
	subFolder.characters = 25
	jpegQ = w.add('dropdownlist',undefined,jpegQualityDropdownList)
	jpegQ.selection = 1
	exportButton = w.add('button',undefined,'Export JPEG')
	exportButton.enabled = false




	gOK = w.add('group')
	cancel = gOK.add('button',undefined,'Cancel')
	autoRun = gOK.add('button',undefined,'Start paginating')

	cancel.onClick = function (){
		w.close()
	}


	w.onShow = function (){
		gOK.location = [w.size.width-225,w.size.height-45]
		panel.size.width = w.size.width - 20
		panel.size.height = 200
		scroll.size.height = 15
		scroll.size.width = panel.size.width-40
		scroll.location = [15,mainGroup.size.height+15]
		scroll.maxvalue = mainGroup.size.width - panel.size.width + 15
	}
for (h = 0; h < dataframe[0].length; h++){
	dumG = mainGroup.add('group')
	// dumG.alignChildren = ['fill','fill']
	dumG.orientation = 'column'
		dumG.add('statictext',undefined,dataframe[0][h])
		assign = dumG.add('button',undefined,'Assign')
		hightlightDrop = dumG.add('dropdownlist',undefined,dataframe[0])
		hightlightDrop.onChange = hightlightcontent
		// dum = dumG.add('button',undefined,'check')
		// dum.onClick = hightlightcontent
		assign.onClick = assignContent
		mycolumn[dataframe[0][h]] = h




	// mainGroup.add('panel{minimumSize:[3,3]}')


	}


	function hightlightcontent(){
		if(app.selection[0].label.search('\r')==-1){
			app.selection[0].label += '\r' + this.parent.children[2].selection.text
		}
		else{
			app.selection[0].label= app.selection[0].label.replace(/\r.+/,'\r'+this.parent.children[2].selection.text)
			// alert(app.selection[0].label.split('\r')[0])

		}
	}

	

	function assignContent(){
		// mainGroup.children[index].children[0].text
		// idx = mycolumn[this.parent.children[0].text]

		if(app.selection.length != 1 ){
			alert('Please select a textframe')
		}
		// else if(app.selection[0].label.length>0){
		// 	alert('Element is already assigned, please check')
		// }
		else{
			app.selection[0].label = this.parent.children[0].text

		}



	}

	exportButton.onClick = function(){
		var doc = app.activeDocument
		outputPath = app.activeDocument.filePath.fullName+'/' + 'Output'
		if(subFolder.text.length>1){
			outputPath = outputPath +'/' + subFolder.text
		}
		Folder(outputPath).exists || Folder(outputPath).create()
		// cP = current Page
		for(cP = 0; cP < doc.pages.length; cP++){
			name = doc.pages[cP].textFrames.item('info').label
			quality = jpegQualityList[jpegQ.selection.text]
			exportJPG(outputPath,name,doc.pages[cP].name,quality)
		}
		alert('Exporting Done!')
		
	}


	autoRun.onClick = function() {
		exportButton.enabled = true
		app.doScript(main,ScriptLanguage.JAVASCRIPT,undefined,UndoModes.ENTIRE_SCRIPT)
		alert('Paginating Done!')
		function main(){
			var doc = app.activeDocument
			for(sp = doc.spreads.length -1 ; sp >= 0; sp--){
				for(r = dataframe.length-1 ; r >=1 ; r--){
					if(r==dataframe.length-1){
						var ws = app.activeDocument.pages[sp].bounds[3]
						var hs = app.activeDocument.pages[sp].bounds[2]
						var tfs = app.activeDocument.pages[sp].textFrames

						var dumTF = app.activeDocument.pages[sp].textFrames.item('info')
						dumTF.isValid || dumTF = app.activeDocument.pages[sp].textFrames.add({geometricBounds:[0,-10,1,1],name:'info',visible:false,strokeColor:'None',fillColor:'None'})
					}
					else{
						newspread = doc.spreads[sp].duplicate(LocationOptions.AFTER,doc.spreads[sp])
						currentPage = newspread.pages[0]
						var ws = currentPage.bounds[3]
						var hs = currentPage.bounds[2]
						var tfs = currentPage.textFrames
						var dumTF = currentPage.textFrames.item('info')
						// dumTF.isValid || dumTF = app.activeDocument.pages[sp].textFrames.add({geometricBounds:[0,-10,1,1],name:'info',visible:false,strokeColor:'None',fillColor:'None'})
					}

					dumTF.label = dataframe[r][colName]+'_'+doc.name.replace('.indd','') +'_' + ws+'x'+ hs+'px'


					



					for (t = 0 ;  t < tfs.length; t ++){

						if(tfs[t].name != 'info' && tfs[t].label!=''){

							var dumarr = tfs[t].label.split('\r')
							//dumarr = [content,hightlight]
							var currentCol = mycolumn[dumarr[0]]
							var hightlight = mycolumn[dumarr[1]]
							// alert(currentCol)
							tfs[t].parentStory.contents = dataframe[r][currentCol]
							if((ws==300||ws==250||ws==336) && (hs==250||hs==280)){
								while (!tfs[t].overflows){
									tfs[t].parentStory.pointSize += 3
								}
								while (tfs[t].overflows){
									tfs[t].parentStory.pointSize -= 3
								}
							}
							else{

								while (!tfs[t].overflows){
									tfs[t].parentStory.pointSize += 1
									}
								while (tfs[t].overflows){
										tfs[t].parentStory.pointSize -= 1
									}
							}
							tfs[t].parentStory.fillColor = 'Black'
							if(hightlight!=undefined){
								if(dataframe[r][hightlight].length>2){
									changeTextcolor(tfs[t],dataframe[r][hightlight])
								}
							}
							// tfs[t].fit(FitOptions.FRAME_TO_CONTENT)
						}
					}				
				}
			}

		}







		// outputPath = app.activeDocument.filePath.fullName+'/' + 'Output'
		// if(subFolder.text.length>1){
		// 	outputPath = outputPath +'/' + subFolder.text
		// }
		// Folder(outputPath).exists || Folder(outputPath).create()
		// if(outputName.selection==null){
		// 	alert('Please select output column')
		// }

		// else{

		// 	for (r = 1; r< dataframe.length; r++){
		// 		//current row index = r

		// 		for(p = 0; p < page.length; p ++){
		// 			var ws = page[p].bounds[3]
		// 			var hs = page[p].bounds[2]
		// 			var tfs = page[p].textFrames

		// 			for (t = 0 ;  t < tfs.length; t ++){

		// 				if(tfs[t].label!=''){

		// 					var dumarr = tfs[t].label.split('\r')
		// 					//dumarr = [content,hightlight]
		// 					var currentCol = mycolumn[dumarr[0]]
		// 					var hightlight = mycolumn[dumarr[1]]
		// 					// alert(currentCol)
		// 					tfs[t].parentStory.contents = dataframe[r][currentCol]
		// 					if((ws==300||ws==250||ws==336) && (hs==250||hs==280)){
		// 						while (!tfs[t].overflows){
		// 							tfs[t].parentStory.pointSize += 3
		// 						}
		// 						while (tfs[t].overflows){
		// 							tfs[t].parentStory.pointSize -= 3
		// 						}
		// 					}
		// 					else{

		// 						while (!tfs[t].overflows){
		// 							tfs[t].parentStory.pointSize += 1
		// 							}
		// 						while (tfs[t].overflows){
		// 								tfs[t].parentStory.pointSize -= 1
		// 							}
		// 					}
		// 					tfs[t].parentStory.fillColor = 'Black'
		// 					if(hightlight!=undefined){
		// 						if(dataframe[r][hightlight].length>2){
		// 							changeTextcolor(tfs[t],dataframe[r][hightlight])
		// 						}
		// 					}
		// 					// tfs[t].fit(FitOptions.FRAME_TO_CONTENT)
		// 				}
		// 			}
		// 		var name = dataframe[r][colName]+'_'+doc.name.replace('.indd','') +'_' + ws+'x'+ hs+'px'

		// 		exportJPG(outputPath,name,page[p].name,quality)
		// 		}

		// 	}
		// 	alert('Paginating Done!')
		// }
	}



w.show()
























function creatFolder(){
	var currentPath = app.activeDocument.filePath.fullName+'/' + 'ouput'
	return Folder(currentPath).exists || Folder(currentPath).create()
}


function exportJPG(folderPath,name,pagenum,quality){
	app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE
	app.jpegExportPreferences.jpegQuality = quality
	app.jpegExportPreferences.pageString = pagenum
	outName = folderPath + '/'+ name +'.jpg'

	app.activeDocument.exportFile(ExportFormat.JPG,File(outName))
}


function changeTextcolor(target,text){
	app.findTextPreferences = NothingEnum.NOTHING
	app.changeTextPreferences = NothingEnum.NOTHING

	app.findTextPreferences.findWhat = text
	app.changeTextPreferences.fillColor = colorHightligh.selection==null?'Black':colorHightligh.selection.text
	target.changeText()
	app.findTextPreferences = NothingEnum.NOTHING
	app.changeTextPreferences = NothingEnum.NOTHING
}



