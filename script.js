// Load necessary packages 
require([
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/layers/GeoJSONLayer",
  "esri/views/MapView",
  "esri/WebMap",
  "esri/Camera",
  "esri/widgets/Home",
  "esri/widgets/ScaleBar",
  "esri/widgets/Search",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Expand",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "dojo/domReady!"
    ], function(
        Map,
         FeatureLayer,
         GeoJSONLayer,
         MapView,
         WebMap,
         Camera,
         Home,
         ScaleBar,
         Search,
         BasemapGallery,
         Expand,
         LayerList,
         Legend
        ) {
  
  // Create the map
  var map = new Map({
    basemap: "topo-vector"
  });
  
  // Create the MapView
  var view = new MapView({
    container: "viewDiv",
    map: map,
    center:[-90.1, 38.6],
    zoom: 11
  });
  
  // Create a home button
  var home_btn = new Home({
    view: view
  });
  
  // Add the home button
  view.ui.add(home_btn, "top-left");
  
  // Create the scale bar
  var scaleBar = new ScaleBar({
    view: view,
    unit: "dual"
  });
  
  // Add the scale bar
  view.ui.add(scaleBar, {
    position: "bottom-left"
  });
  
    view.ui.add(
          new Search({
            view: view
          }),
          "top-right"
        );
  
  var basemapGallery = new BasemapGallery({
    view: view,
    container: document.createElement("div")
  });
  
  // Create the expand widget
  var bgExpand = new Expand({
    view: view,
    content: basemapGallery
  });
  
  view.ui.add(bgExpand, "top-right");

  // close the expand whenever a basemap is selected
  basemapGallery.watch("activeBasemap", function() {
    var mobileSize = view.heightBreakpoint === "xsmall" || view.widthBreakpoint === "xsmall";
    if (mobileSize) {
      bgExpand.collapse();
    }
  });
  
  var layerList = new LayerList({
    container: document.createElement("div"),
    view: view
  });
  
  var layerListExpand = new Expand({
    expandIconClass: "esri-icon-layer-list",  
    view: view,
    content: layerList
  });
  view.ui.add(layerListExpand, "top-left");
  
  const labelClass = {
    symbol: {
      type: "text", 
      color: "black",
      font: {
        family: "Playfair Display",
        size: 8,
        weight: "bold"
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.NHD_NAME"
    }
  };
  
  // Create pop-up information from metdata tags
  // Pop-up for 2000 population by St. Louis neighborhood/census tracts
  var template_population = { // autocasts as new PopupTemplate()
        title: "Neighborhood: {NHD_NAME}",
        content: [{
          type: "fields",
          fieldInfos: [{
            fieldName: "POP00",
            label: "2000 Population: ",
            visible: true,
            format: {
              digitSeparator: true,
              places: 0
            }
          }, {
            fieldName: "WHITE00",
            label: "White Population 2000: ",
            visible: true,
            format: {
              digitSeparator: true,
              places: 0
            }
          }, {
            fieldName: "BLACK00",
            label: "Black Population 2000: ",
            visible: true,
            format: {
              digitSeparator: true,
              places: 0
            }
          }, {
            fieldName: "ASIAN00",
            label: "Asian Population 2000: ",
            visible: true,
            format: {
              digitSeparator: true,
              places: 0
            }
          },{
            fieldName: "HISP00",
            label: "Hispanic Population 2000: ",
            visible: true,
            format: {
              digitSeparator: true,
              places: 0
            }
          }]
        }]
  };
  
  // Creat pop-up template for St. Louis highway intersections
  var template_road = { // autocasts as new PopupTemplate()
    title: "FULLNAME {FULLNAME}",
    content: [{
      type: "fields",
      fieldInfos: [{
        fieldName: "St. Louis Highways",
        label: "Street Name: ",
        visible: true,
        format: {
          digitSeparator: true,
          places: 0
        }
      }, {
        fieldName: "NHD_NUMTXT",
        label: "Address: ",
        visible: true,
        format: {
          digitSeparator: true,
          places: 0
        }
      }, {
        fieldName: "Length in Miles",
        label: "Street length: ",
        visible: true,
        format: {
          digitSeparator: true,
          places: 0
        }
      }]
    }]
  };
  
  // Create pop-up for coffee layer
  // This will not work when turning coffee layer into a heatmap
  var template_coffee = { // autocasts as new PopupTemplate()
    title: "Coffee Neighborhood: {NHD_NAME}",
    content: [{
      type: "fields",
      fieldInfos: [{
        fieldName: "NHD_NAME",
        label: "Neighborhood: ",
        visible: true,
        format: {
          digitSeparator: true,
          places: 0
        }
      }, {
        fieldName: "Address",
        label: "Address: ",
        visible: true,
        format: {
          digitSeparator: true,
          places: 0
        }
      }]
    }]
  };
  
  // Create FeatureLayers
  // Reference the popupTemplate instance in the popupTemplate property of FeatureLayer
  // Create St. Louis Population FeatureLayer
  var featureLayer_stl_population = new FeatureLayer({
    url: "https://services2.arcgis.com/bB9Y1bGKerz1PTl5/arcgis/rest/services/Merge_neighborhood_population/FeatureServer",
    outFields: ["*"],
    popupTemplate: template_population
  });
  
  // Create St. Louis Neighborhoods FeatureLayer
  var featureLayer_stl_neighborhood = new FeatureLayer({
    url: "https://services2.arcgis.com/bB9Y1bGKerz1PTl5/ArcGIS/rest/services/STL_Neighborhood/FeatureServer",
    outFields: ["*"],
    popupTemplate: template_population,
    labelingInfo: [labelClass],
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "rgba(0,100,0,0.6)",
        size: 3,
        outline: {
          color: [0, 0, 0, 0.1],
          width: 0.5
        }
      }
    }
  })
  // Create St. Louis Highway Intersections FeatureLayer
  var featureLayer_stl_road = new FeatureLayer({
    url: "https://services2.arcgis.com/bB9Y1bGKerz1PTl5/arcgis/rest/services/Intersect_of_Saint_Louis_Highways/FeatureServer",
    outFields: ["*"],
    popupTemplate: template_road
  });
  
  // Create Starbucks cluster renderer
  const starbucks_cluster = {
    type: "cluster",
    clusterRadius: "100px",
    popupTemplate: {
      content: "This cluster represents {cluster_count} starbucks.",
      fieldInfos: [{
        fieldName: "cluster_count",
        format: {
          places: 0,
          digitSeparator: true
        }
      }]
    },
    clusterMinSize: "24px",
    clusterMaxSize: "60px",
    labelingInfo: [{
      deconflictionStrategy: "none",
      labelExpressionInfo: {
        expression:
        "Text($feature.cluster_count, '#,###')"
      },
      symbol: {
        type: "text",
        color: "#FFFFFF",
        font: {
          weight: "bold",
          family: "Noto Sans",
          size: "12px"
        }
      },
      labelPlacement: "center-center",
    }]
  }
  // Create Starbucks FeatureLayer
  const starbucks_layer = new FeatureLayer({
    title: "Starbucks Coffee",
    url: "https://services2.arcgis.com/bB9Y1bGKerz1PTl5/arcgis/rest/services/Intersect_of_Starbucks_Locations_and_STL_Neighborhood___Neighborhood_Boundaries/FeatureServer",
    featureReduction: starbucks_cluster,
    outFields: ["*"],
    popupTemplate: template_coffee,
    renderer: {
      type: "simple",
      field: "mag",
      symbol: {
        type: "simple-marker",
        size: 4,
        color: "#FF5733",
        outline: {
          color: "rgba(0, 139, 174, 0.5)",
          width: 5
        }
      }
    }
  });
  
  // Create the symbol for road
  var symbol_road = {
    type: "simple-line", 
    color:"red",
    size: 3
  };
  
  // Create the renderer for St. Louis Highways
  featureLayer_stl_road.renderer = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: symbol_road
  };
  
  
  // Create the symbol for St. Louis Neighborhoods
  var symbol_neighborhood = {
    type: "simple-line", 
    color:"black",
    size: 3
  };
  
  // Create the renderer for St. Louis Neighborhoods  
  featureLayer_stl_neighborhood.renderer = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: symbol_neighborhood
  };
  
    var legend = new Legend({
    view: view,
    layerInfos: [{
      layer: starbucks_layer,
      title: "Starbucks"
    },{
      layer: featureLayer_stl_road,
      title: "St. Louis Highways"
    },{
      layer: featureLayer_stl_neighborhood,
      title: "St. Louis Neighborhoods"
    },{
      layer: featureLayer_stl_population,
      title: "St. Louis Population 2000"
    }]
  });
  
  
  view.ui.add(legend, "bottom-right"); 

  
  // Add the St. Louis Population FeatureLayer
  map.add(featureLayer_stl_population);
  
  // Add the St. Louis Neighborhood FeatureLayer
  map.add(featureLayer_stl_neighborhood);
  
  // Add the St. Louis Highways FeatureLayer
  map.add(featureLayer_stl_road);
  
  // Add the St. Louis Starbucks FeatureLayer
  map.add(starbucks_layer);
});
