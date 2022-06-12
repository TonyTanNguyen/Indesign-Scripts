
//============  1 ==============///

#targetengine 'session'


var myoval = app.activeDocument.ovals[0]
var rec0 = app.activeDocument.rectangles[0];
var pw = app.activeDocument.pages[0].bounds[3]
var ph = app.activeDocument.pages[0].bounds[2]


//===========================================================================//



//========== 2 =================


var myIdleTask = app.idleTasks.add({name: "idle_task",
sleep: 300
});
var onIdleEventListener = myIdleTask.addEventListener(IdleEvent.ON_IDLE, onIdleEventHandler, false);



//==========================================================================//


//Get dimension of 1st rec
var a = rec0.geometricBounds[3]-rec0.geometricBounds[1]

//step starter
var direction = [a,0]


//================ 3 ====================//


function onIdleEventHandler(myIdleEvent) {
	
		//precheck if hit the wall (right-side wall)
		if(rec0.geometricBounds[3] > app.activeDocument.pages[0].bounds[3]){
			app.idleTasks.everyItem().remove()
			app.eventListeners.everyItem().remove()
			alert('You are die!!!!!')
			w.close()
			return

		}


		//move 1st rec, then the rest will follow
		oldLoca = app.activeDocument.rectangles.everyItem().geometricBounds //to save old locations, for the rest rectangles to follow the 1st one
		rec0.move(undefined, direction)
		

		//check if eat ball
		var check = ifHit(rec0,myoval)

		if(check){
			makeRec(app.activeDocument.rectangles.length-1)
			var newPos = [randomNum(10,pw-10),randomNum(10,ph-10)]
			myoval.move(newPos)
			myIdleTask.sleep -= 20

		}


		//moving the rest rectangles
		var i = 1

		while (i<app.activeDocument.rectangles.length){

			app.activeDocument.rectangles[i].move([oldLoca[i-1][1],oldLoca[i-1][0]])

			i+=1

		}



	}





function randomNum(min,max){
	return Math.floor(Math.random() * (max - min) + min)
}


//create rec
function makeRec(n){
	var mysetting = {
	fillColor : app.activeDocument.rectangles[n].fillColor,
	strokeWeight : app.activeDocument.rectangles[n].strokeWeight,
	geometricBounds: app.activeDocument.rectangles[n].geometricBounds,
	strokeColor : app.activeDocument.rectangles[n].strokeColor

	}
	newr = app.activeDocument.rectangles.add(mysetting)
	newr.sendBackward()
	return newr

}




function ifHit(myrec,oval0){
	var recCenter = [myrec.geometricBounds[0]+a/2,myrec.geometricBounds[1]+a/2]
	var ovalCenter = [oval0.geometricBounds[0]+a/2,oval0.geometricBounds[1]+a/2]

	if((Math.pow(recCenter[1]-ovalCenter[1],2) + Math.pow(recCenter[0]- ovalCenter[0],2)) < Math.pow(a,2)){
		return true
	}
	

}



//create controler
var w = new Window('palette')
var img = w.add('edittext',undefined,'QWERTY')

img.addEventListener('keydown', function(kd) {imageclick(kd)})
img.active=true
w.show()


function imageclick(k){

	if(k.keyName=='Up'){
		direction = [0,-a]
		
	}
	if(k.keyName=='Down'){
		direction = [0,a]
		
	}
	if(k.keyName=='Left'){
		direction = [-a,0]
		
	}
	if(k.keyName=='Right'){
		direction = [a,0]
		
	}
	if(k.keyName=='C'){
		app.idleTasks.everyItem().remove()
		app.eventListeners.everyItem().remove()
	}


}




