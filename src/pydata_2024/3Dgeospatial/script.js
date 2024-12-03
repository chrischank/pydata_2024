
    const Cesium = require("cesium");
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMmQ0MThiMi02NmNiLTQwOGUtYTcxMS01ZjcyYjUyMDgxNWIiLCJpZCI6MjU5Nzk3LCJpYXQiOjE3MzMyNDk2MjB9.BTizOfGveOYjFW2HLDHgYKTvqliavZ0t1LIl5HhigSA';
    
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrain: Cesium.Terrain.fromWorldTerrain(),
    });

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
      url: 'https://cartodb-basemaps-1.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    }));
    
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees( -0.118092,51.509865, 800),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
      }
    });
  
    let geoJsonGrid = {
      type: 'FeatureCollection',
      features: []
    };
    
    let gridWidth = 0.01;  // in degrees
     let gridHeight = 0.01; // in degrees
    let cellSize = 0.001;  // in degrees
    
    for (let x = -gridWidth / 2; x <= gridWidth / 2; x += cellSize) {
      for (let y = -gridHeight / 2; y <= gridHeight / 2; y += cellSize) {
        let feature = {
          type: 'Feature',
          properties: {
            index: geoJsonGrid.features.length
  
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-122.4194 + x, 37.7749 + y, 0],
              [-122.4194 + x + cellSize, 37.7749 + y, 0],
              [-122.4194 + x + cellSize, 37.7749 + y + cellSize, 0],
              [-122.4194 + x, 37.7749 + y + cellSize, 0],
              [-122.4194 + x, 37.7749 + y, 0]
            ]],
          },
        };
      
        geoJsonGrid.features.push(feature);
      }
    }
    
    let dataSource = Cesium.GeoJsonDataSource.load(geoJsonGrid, {
      clampToGround: true,
      stroke: Cesium.Color.GRAY,
      fill: Cesium.Color.TRANSPARENT
    });
    
    viewer.dataSources.add(dataSource);
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let tooltip = createTooltip();
  
  // Store the current highlighted entity
  let highlightedEntity = undefined;
  
  handler.setInputAction(function (movement) {
  // Check for hover over entities
  let pickedObject = viewer.scene.pick(movement.endPosition);
  if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    if (highlightedEntity !== pickedObject.id) {
      // Reset the color of the previous highlighted cell
      if (highlightedEntity) {
        highlightedEntity.polygon.material = Cesium.Color.GRAY.withAlpha(0.01); // Set gray with low opacity
        highlightedEntity.polygon.outlineColor = Cesium.Color.GRAY; // Set outline color
        highlightedEntity.polygon.outlineWidth = 2; // Set outline width (thin)
      }
  
      // Highlight the current cell by filling and adding an outline
      highlightedEntity = pickedObject.id;
      highlightedEntity.polygon.material = Cesium.Color.GRAY.withAlpha(0.5); // Set gray with higher opacity
      highlightedEntity.polygon.outlineColor = Cesium.Color.BLACK; // Set outline color
      highlightedEntity.polygon.outlineWidth = 4; // Set outline width (thick)
  
      // Update tooltip with details
      updateTooltip(pickedObject.id.properties);
    }
  } else {
    // If not hovering over any cell, retain fill color and adjust outline
    if (highlightedEntity) {
      highlightedEntity.polygon.material = Cesium.Color.GRAY.withAlpha(0.01); // Set gray with low opacity
      highlightedEntity.polygon.outlineColor = Cesium.Color.GRAY; // Set outline color
      highlightedEntity.polygon.outlineWidth = 2; // Set outline width (thin)
      highlightedEntity = undefined;
  
      // Hide tooltip when mouse leaves the cell
      tooltip.style.display = 'none';
    }
  }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  
  handler.setInputAction(function (movement) {
  // Check for click on entities
  let pickedObject = viewer.scene.pick(movement.position);
  if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    // Hide tooltip on click
    tooltip.style.display = 'none';
  
    // You can perform other actions based on the clicked cell details
    let cellDetails = pickedObject.id.properties;
    console.log("Clicked on cell number: ", cellDetails.index);
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  
  // Function to create a tooltip div
  function createTooltip() {
  let tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);
  return tooltip;
  }
  
  // Function to update the tooltip content and position
  function updateTooltip(properties) {
  tooltip.innerHTML = 'Cell Number: ' + properties.index;
  tooltip.style.display = 'block';
  
  // Get the center of the polygon
  let center = Cesium.BoundingSphere.fromPoints(properties.polygon.hierarchy[0].positions).center;
  let newPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, center);
  tooltip.style.top = newPosition.y + 'px';
  tooltip.style.left = newPosition.x + 'px';
  }
  
    handler.setInputAction(function (movement) {
      // Check for click on entities
      let pickedObject = viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        // Hide tooltip on click
        tooltip.style.display = 'none';
    
        // You can perform other actions based on the clicked cell details
        let cellDetails = pickedObject.id.properties;
        console.log("Clicked on cell number: ", cellDetails.index);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
    // Function to create a tooltip div
    function createTooltip() {
      let tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.style.display = 'none';
      document.body.appendChild(tooltip);
      return tooltip;
    }
    
    function updateTooltip(properties) {
      tooltip.innerHTML = 'Cell Number: ' + properties.index;
      tooltip.style.display = 'block';
    
      // Get the center of the polygon
      let center = Cesium.BoundingSphere.fromPoints(properties.polygon.hierarchy[0].positions).center;
      let newPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, center);
      tooltip.style.top = newPosition.y + 'px';
      tooltip.style.left = newPosition.x + 'px';
    }
    handler.setInputAction(function (movement) {
      // Check for click on entities
      let pickedObject = viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        // Show the cell number in the console when clicked
        console.log("Clicked on cell number: ", pickedObject.id.properties.index);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
    
  
  
  handler.setInputAction(function (movement) {
  // Check for click on entities
  let pickedObject = viewer.scene.pick(movement.position);
  if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
    // Show the cell number in the console when clicked
    console.log("Clicked on cell number: ", pickedObject.id.properties.index);
  }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  
  function getRandomCellCoordinates() {
  let randomX = -gridWidth / 2 + Math.random() * gridWidth;
  let randomY = -gridHeight / 2 + Math.random() * gridHeight;
  
  return {
      longitude: -122.4194 + randomX,
      latitude: 37.7749 + randomY,
      height: 0
  };
  }
  
  function getRandomCellCoordinates() {
      let randomX = -gridWidth / 2 + Math.random() * gridWidth;
      let randomY = -gridHeight / 2 + Math.random() * gridHeight;
  
      return {
          longitude: -122.4194 + randomX,
          latitude: 37.7749 + randomY,
          height: 0
      };
  }
  
  function placeModelOnRandomCell() {
      let randomCellCoordinates = getRandomCellCoordinates();
  
      const entity = viewer.entities.add({
          name: 'Random Model',
          position: Cesium.Cartesian3.fromDegrees(randomCellCoordinates.longitude, randomCellCoordinates.latitude, randomCellCoordinates.height),
          model: {
              uri: '../data/tree.glb',
              scale: 0.5,
          },
      });
  }
  // Feature 3: SHOWING BUILDINGS
  async function showBuildings() {
      const buildingTileset = await Cesium.createOsmBuildingsAsync();
      viewer.scene.primitives.add(buildingTileset);
  }
   
    
  //Feature 4: SHOWING TFL LINES
  //const geojsonUrl = '../data/tfl/tfl_lines_edited.geojson';
  const geojsonUrl = '../data/tfl/tube_polygons.geojson';
  function loadGeoJsonData() {
    Cesium.GeoJsonDataSource.load(geojsonUrl).then(function(dataSource) {
      viewer.dataSources.add(dataSource);
  
      // Loop through all the entities loaded from the GeoJSON
      dataSource.entities.values.forEach(function(entity) {
        if (entity.polygon) {
          // Get the line name from the entity's properties (assuming the property is called 'line_name')
          const lineName = entity.properties.line_name.getValue(); // Replace with correct property if needed
          const lineColor = getLineColor(lineName); // Get the color for this line
  
          // Apply the specific color to the polygon
          entity.polygon.material = Cesium.Color.fromCssColorString(lineColor);
          entity.polygon.outline = true;
          entity.polygon.outlineColor = Cesium.Color.BLACK; // Black outline
          entity.polygon.height = 100; // Set height for extrusion
        }
  
        if (entity.polyline) {
          const lineName = entity.properties.line_name.getValue(); // Get the line name for polyline
          const lineColor = getLineColor(lineName); // Get the color for this line
  
          // Apply color to polyline
          entity.polyline.material = Cesium.Color.fromCssColorString(lineColor);
          entity.polyline.width = 3; // Set line width
        }
      });
  
      viewer.zoomTo(dataSource);
      viewer.scene.morphTo3D(1); // Ensure 3D mode
    }).otherwise(function(error) {
      console.error("Error loading GeoJSON: ", error);
    });
  }
  
  // Function to map line names to colors
  function getLineColor(lineName) {
    const lineColors = {
      "Bakerloo": "#B36305",
      "Central": "#E32017",
      "Circle": "#FFD300",
      "District": "#00782A",
      "Hammersmith & City": "#F3A9BB",
      "Jubilee": "#A0A5A9",
      "Metropolitan": "#9B0056",
      "Northern": "#000000",
      "Piccadilly": "#003688",
      "Victoria": "#0098D4",
      "Waterloo & City": "#95CDBA",
      "DLR": "#00A4A7",
      "London Overground": "#EE7C0E",
      "Tramlink": "#84B817",
      "Emirates Air Line": "#E21836",
      "Crossrail": "#7156A5"
    };
  
    // Return the color for the corresponding line or default to red if not found
    return lineColors[lineName] || "#FF0000"; 
  }
  