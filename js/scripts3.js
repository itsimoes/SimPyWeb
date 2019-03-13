//var original = document.getElementById('pythonarchive').value;
var red = "orangered";  // 0 or false
var green = "#C8DA2B";  // 1 or true
    function init() {      
      if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
      var $ = go.GraphObject.make;  // for conciseness in defining templates
      myDiagram =
        $(go.Diagram, "myDiagramDiv",  // create a new Diagram in the HTML DIV element "myDiagramDiv"
          {
            initialContentAlignment: go.Spot.Center,
            allowDrop: true,  // Nodes from the Palette can be dropped into the Diagram
            "draggingTool.isGridSnapEnabled": true,  // dragged nodes will snap to a grid of 10x10 cells
            "undoManager.isEnabled": true
          });
      // when the document is modified, add a "*" to the title and enable the "Save" button
      myDiagram.addDiagramListener("Modified", function(e) {
        var button = document.getElementById("saveModel");        
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
          if (idx < 0) document.title += "*";
        } else {
          if (idx >= 0) document.title = document.title.substr(0, idx);
        }
      });

      // myDiagram model
      myDiagram.model =
      $(go.GraphLinksModel,
        {
          copiesArrays: true,
          copiesArrayObjects: true,         
        });

      var palette = new go.Palette("palette");  // create a new Palette in the HTML DIV element "palette"
      // creates relinkable Links that will avoid crossing Nodes when possible and will jump over other Links in their paths
      
      myDiagram.linkTemplate =
        $(go.Link,
          {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 3,
            relinkableFrom: true, relinkableTo: true,
            selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
            shadowOffset: new go.Point(0, 0), shadowBlur: 5, shadowColor: "blue",
          },
          new go.Binding("isShadowed", "isSelected").ofObject(),
          $(go.Shape,
            { name: "SHAPE", strokeWidth: 2, stroke: red }));
     
      // node template helpers
      var sharedToolTip =
        $(go.Adornment, "Auto",
          $(go.Shape, "RoundedRectangle", { fill: "lightyellow" }),
          $(go.TextBlock, { margin: 2 },
            new go.Binding("text",  "" , function(d) { return d.category; })));
     
      // define some common property settings
      function nodeStyle() {
        return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                new go.Binding("isShadowed", "isSelected").ofObject(),
                {
                  selectionAdorned: false,
                  shadowOffset: new go.Point(0, 0),
                  shadowBlur: 15,
                  shadowColor: "blue",
                  toolTip: sharedToolTip
                }];                
      }
     
      function shapeStyle() {
        return {
          name: "NODESHAPE",
          fill: "lightgray",
          stroke: "darkslategray",
          desiredSize: new go.Size(40, 40),
          strokeWidth: 2
        };
      }
      
      function portStyle(input) {
        return {
          desiredSize: new go.Size(6, 6),
          fill: "black",
          fromSpot: go.Spot.Right,
          fromLinkable: !input,
          fromMaxLinks: 1,
          toSpot: go.Spot.Left,
          toLinkable: input,
          toMaxLinks: 1,
          cursor: "pointer"
        };
      }

      // define values for each variable 
      var value2 = value1 = "0";

      // define templates for each type of node
      var inputTemplate =
        $(go.Node, "Spot", nodeStyle(),
          $(go.Shape, "Circle", shapeStyle(),
            { fill: "#99ccff" }),  // override the default fill (from shapeStyle()) to be red
          $(go.Shape, "Rectangle", portStyle(false),  // the only port
            { portId: "out", alignment: new go.Spot(1, 0.5) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function (e, obj) {
                e.diagram.startTransaction("Toggle Input");
                var shp = obj.findObject("NODESHAPE");
                shp.fill = (shp.fill === "#99ccff") ? "#99ccff" : "#99ccff";
                updateStates();
                e.diagram.commitTransaction("Toggle Input");
            }
          },
          
          $(go.TextBlock,          
              // background: "lightblue",
              {editable: true, isMultiline: false },
              new go.Binding("text", "value1").makeTwoWay())  // textblock.text = data.key        
        );

      var outputTemplate =
        $(go.Node, "Spot", nodeStyle(),
          $(go.Shape, "Circle", shapeStyle(),
            { fill: green }),  // override the default fill (from shapeStyle()) to be green
          $(go.Shape, "Rectangle", portStyle(true), // the only port
            { portId: "in", alignment: new go.Spot(0, 0.5) }),
          
          $(go.TextBlock,          
              // background: "lightblue",
              {editable: true, isMultiline: false },
              new go.Binding("text", "value1").makeTwoWay())  // textblock.text = data.key     
        );

      var queueTemplate =
        $(go.Node, "Spot", nodeStyle(),
          $(go.Shape, "Rectangle", shapeStyle(),
            { fill: red }),  // override the default fill (from shapeStyle()) to be green
          $(go.Shape, "Rectangle", portStyle(true),  
            { portId: "in", alignment: new go.Spot(0, 0.5) }),
          $(go.Shape, "Rectangle", portStyle(false),  
            { portId: "out", alignment: new go.Spot(1, 0.5) }),
          
          $(go.TextBlock,          
              // background: "lightblue",
              {editable: true, isMultiline: false },
              new go.Binding("text", "value1").makeTwoWay())  // textblock.text = data.key     
        );

      var forkTemplate =
        $(go.Node, "Spot", nodeStyle(),
          $(go.Shape, "MicroformRecording", shapeStyle(),
            { angle: 180 }),            
          $(go.Shape, "Rectangle", portStyle(true),
            { portId: "in", alignment: new go.Spot(0, 0.5) }),
          $(go.Shape, "Rectangle", portStyle(false),
            { portId: "out1", alignment: new go.Spot(1, 0.2577775) }),
          $(go.Shape, "Rectangle", portStyle(false),
            { portId: "out2", alignment: new go.Spot(1, 0.7377775) }),
          
          $(go.TextBlock,
            { alignment: new go.Spot(0.7, 0.30),
              //background: "lightblue",
              editable: true, isMultiline: false },
            new go.Binding("text", "value1").makeTwoWay()),  // textblock.text = data.key 
          
         /* $(go.TextBlock,
            { alignment: new go.Spot(0.7, 0.73),
              //background: "lightblue",
              editable: true, isMultiline: false },
            new go.Binding("text", "value2").makeTwoWay())  // textblock.text = data.key 
          */
        );
      
      // add the templates created above to myDiagram and palette
      myDiagram.nodeTemplateMap.add("Input", inputTemplate);
      myDiagram.nodeTemplateMap.add("Output", outputTemplate);
      myDiagram.nodeTemplateMap.add("Queue", queueTemplate);
      myDiagram.nodeTemplateMap.add("Fork", forkTemplate);
           
      // share the template map with the Palette     
      palette.model.nodeDataArray = [
        { category: "Input" }, 
        { category: "Output" },
        { category: "Queue" },
        { category: "Fork" }        
      ];
      palette.nodeTemplateMap = myDiagram.nodeTemplateMap;

      // load the initial diagram
      load();

      // continually update the diagram
      loop();
    }
    // update the diagram every 250 milliseconds
    function loop() {
      setTimeout(function() { updateStates(); loop(); }, 250);
    }
    // update the value and appearance of each node according to its type and input values
    function updateStates() {
      var oldskip = myDiagram.skipsUndoManager;
      myDiagram.skipsUndoManager = true;
      // do all "input" nodes first
      myDiagram.nodes.each(function(node) {
          if (node.category === "input") {
            doInput(node);
          }
        });
      // now we can do all other kinds of nodes
      myDiagram.nodes.each(function(node) {
          switch (node.category) {
            case "Queue":   doQueue(node); break;
            case "Fork":     doFork(node); break;
            case "Qutput": doOutput(node); break;
            case "Input": break;  // doInput already called, above
          }
        });
      myDiagram.skipsUndoManager = oldskip;
    }
    // helper predicate
    function linkIsTrue(link) {  // assume the given Link has a Shape named "SHAPE"
      return link.findObject("SHAPE").stroke === green;
    }
    // helper function for propagating results
    function setOutputLinks(node, color) {
      node.findLinksOutOf().each(function(link) { link.findObject("SHAPE").stroke = color; });
    }
    // update nodes by the specific function for its type
    // determine the color of links coming out of this node based on those coming in and node type
    function doInput(node) {
      // the output is just the node's Shape.fill
      setOutputLinks(node, node.findObject("NODESHAPE").fill);
    }
    function doQueue(node) {
      var color = node.findLinksInto().all(linkIsTrue) ? green : red;
      setOutputLinks(node, color);
    }
    function doFork(node) {
      var color = node.findLinksInto().all(linkIsTrue) ? green : red;
      setOutputLinks(node, color);
    }
    function doOutput(node) {
      // assume there is just one input link
      // we just need to update the node's Shape.fill
      node.linksConnected.each(function(link) { node.findObject("NODESHAPE").fill = link.findObject("SHAPE").stroke; });
    }
    // save a model to and load a model from JSON text, displayed below the Diagram
    function save() {
      document.getElementById("mySavedModel").value = myDiagram.model.toJson();     
      myDiagram.isModified = false;
      //var button2 = document.getElementById("loadModel");     
      //button2.disabled = false;
    }
    function load() {      
      myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
      //queueCounter();
      pythonCreator();
      //console.log(myDiagram.model);
      //var button2 = document.getElementById("loadModel");     
      //if (button2) button2.disabled = true;
      
    }

    function pythonCreator(){
            
      var jsonList = JSON.parse(document.getElementById("mySavedModel").value);
      var pythonEdited = document.getElementById('pythonOriginal').value;
      var edited = pythonEdited.split("\n");
      var line = 34;
      edited.splice(line,1,"");
      edited.splice(line+1,1,"");
      edited.splice(line+2,1,"");
      edited.splice(line+3,1,"");
      edited.splice(line+4,1,"");
      
      // início da parte nova 
      var nodeKey = nodeVal1 = nodeVal2 = "";

      for (var i = 0; i < jsonList.nodeDataArray.length; i++ ){
        
        if (jsonList.nodeDataArray[i].category == "Input"){
          nodeVal1 = jsonList.nodeDataArray[i].value1;
          nodeKey = jsonList.nodeDataArray[i].key; 
           // write Input values on edited archive
          //pythonEdited.splice(11,1,"arrivalTime = " + nodeVal1); 
          searchNextNode(jsonList,edited,nodeKey,line);          
          break;
        }        
      }

      // writing on python archive or error message
      //console.log(pythonEdited);
      edited.value = edited.join("\n");
      pythonEdited = edited;
      document.getElementById('pythonarchive').value = pythonEdited.value;
      //console.log(pythonEdited);
    }

    function searchNextNode(jsonList,edited,nodeKey,line){
      for (var i = 0; i < jsonList.linkDataArray.length; i++ ){
        if (jsonList.linkDataArray[i].from == nodeKey && jsonList.linkDataArray[i].to != false ){
          nodeKey = jsonList.linkDataArray[i].to;
          console.log(line);
          
          pythonWriter(jsonList,edited,nodeKey,line);          
        }
        line += 6;
      } 
    }

    function pythonWriter(jsonList,edited,nodeKey,line){
      for (var i = 0; i < jsonList.nodeDataArray.length; i++ ){
        var nodeVal1 = jsonList.nodeDataArray[i].value1;
        if (jsonList.nodeDataArray[i].key == nodeKey){
          if (jsonList.nodeDataArray[i].category == "Queue"){            
            // insert a queue on python            
            edited.splice(line,0,`  req${nodeKey} = queues.request()`);
            edited.splice(line+1,0,"  yield req");
            edited.splice(line+2,0,"  queueUsage += 1");
            edited.splice(line+3,0,`  yield env.timeout(${nodeVal1})`);
            edited.splice(line+4,0,"  queues.release(req)");  
            edited.splice(line+5,0,"");
            
            
            console.log(line);
            //searchNextNode(jsonList,edited,nodeKey,line);
          }
          else if (jsonList.nodeDataArray[i].category == "Fork"){
            // insert a fork on python
            edited.splice(line+1,0,"  Fork");
            var nodeVal2 = jsonList.nodeDataArray[i].value2;
            nodeVal2 = 1-nodeVal1;
            //searchNextNode(jsonList,edited,nodeKey,line);
          }
          else if (jsonList.nodeDataArray[i].category == "Output"){
            // insert an output on python
          }
        }
      }
    }

 /* 
        if (jsonList.nodeDataArray[i].category == "Input"){
          var inputKey = jsonList.nodeDataArray[i].key //node name
          var inputVal = jsonList.nodeDataArray[i].value1 //node value
          var nodeKey = inputKey
          //to do: add inputVal to python archive
        
          for (var j = 0; j < jsonList.linkDataArray.length; j++ ){  
            
            if (jsonList.linkDataArray[j].from == nodeKey){
              nodeKey = jsonList.linkDataArray[j].to             
              
              for (var k = 0; k < jsonList.nodeDataArray.length; k++ ){
                
                if (jsonList.nodeDataArray[k].key == nodeKey){
                  var nodeVal = jsonList.nodeDataArray[k].value1

                  if (jsonList.nodeDataArray[k].category == "Queue"){
                    //to do: add nodeVal to python archive
                    //queueAdd(nodeVal);
                  }
                  else if (jsonList.nodeDataArray[k].category == "Fork"){
                    var nodeVal2 = jsonList.nodeDataArray[k].value2
                    //to do: add nodeVal to python archive
                    //to do: add nodeVal2 to python archive
                    //forkAdd(nodeVal,nodeVal2);
                  }
                  else if (jsonList.nodeDataArray[k].category == "Output"){
                    //to do: finish and break
                    //outputAdd();
                  }

                }
              }
            }
          }
        }
        */
        
          
      // fim da parte nova
      /*
      console.log(jsonList.nodeDataArray[2].key);
      
      if (jsonList.nodeDataArray[2].key == "-3")
        console.log("São iguais!");
      else
        console.log("Não são iguais!");
      
      var i =0;
      
      for (var i = 0; i < jsonList.linkDataArray.length; i++) {
        for (var j = 0; j < jsonList.nodeDataArray.length; j++) {
          nodeCategory = jsonList.nodeDataArray[j].category;
          if (jsonList.nodeDataArray[j].key == jsonList.linkDataArray[i].from){console.log("É igual!");}
          
        }
      }  




      //console.log(jsonList.linkDataArray.length);
      */

/*
    function queueCounter(){

      var element = document.getElementById("mySavedModel").value;
      var part = element.split("linkDataArray");

      //console.log(part[1]);

     
      var splitter = part[1].split(/[:,]/);
    //  console.log(splitter);
     
      var queueAdd = 0;

      for(var i=0;i<splitter.length;i++){
        var counter=0;
        if (splitter[i] == " \"to\""){
          var found = splitter[i+1];
          console.log(found);
          
            for(var j=0;j<splitter.length;j++){
              if (found == splitter[j]){
                counter++;
              }
          }           
        } 

        if (counter >= 2){
          queueAdd++;
        } 
        
      }

      console.log(queueAdd);

      
      toPython(queueAdd);

    }

    function toPython(queueAdd){
      
      
      var pythonEdited = document.getElementById('pythonOriginal').value;
      
      //console.log(pythonEdited);

      var edited = pythonEdited.split("\n");

      var line = 30;

      if (queueAdd == 0) edited = ["Error!"];

     
      while(queueAdd>1){
        
        edited.splice(line,0,"    env.process(queue(env,clients,queues))");

      
        queueAdd--;
        line++;
      }
      
     
      console.log(edited);

     
      edited.value = edited.join("\n");
      
      document.getElementById('pythonarchive').value = edited.value;
      //document.getElementById('pythonarchive').value = edited;


      //console.log(pythonEdited);
    }
    

    //---------------------------------------------------------------------------------------------------//


    function inputAdd(nodeVal){
  
      //add Input

      var pythonEdited = document.getElementById('pythonOriginal').value;
      var line = 10; //line to be modified **CHANGE**
      
      //if (test == 0) edited = ["Error!"]; //Error message if something is wrong!
      
      edited.splice(line,0,"arrivalTime = 10"); //changing selected line
      
    }
  
    function queueAdd(nodeVal,test,line){
      
      var pythonEdited = document.getElementById('pythonOriginal').value;
      //var line = 0; //line to be modified **CHANGE**
      
      if (test == 0) edited = ["Error!"]; //Error message if something is wrong!
      
      edited.splice(line,0,"    env.process(queue(env,clients,queues))"); //adding queue to selected line
      
      line++;
      

    }

    function forkAdd(nodeVal,nodeVal2,test,line){
  
      //add Fork >

    }

    function outputAdd(){
  
      //add Output

    }
    
*/

