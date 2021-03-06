import Feature from '../../../../src/ol/Feature.js';
import LineString from '../../../../src/ol/geom/LineString.js';
import MultiLineString from '../../../../src/ol/geom/MultiLineString.js';
import MultiPolygon from '../../../../src/ol/geom/MultiPolygon.js';
import Point from '../../../../src/ol/geom/Point.js';
import Polygon from '../../../../src/ol/geom/Polygon.js';
import Map from '../../../../src/ol/Map.js';
import View from '../../../../src/ol/View.js';
import VectorLayer from '../../../../src/ol/layer/Vector.js';
import VectorSource from '../../../../src/ol/source/Vector.js';
import Text from '../../../../src/ol/style/Text.js';
import Fill from '../../../../src/ol/style/Fill.js';
import Style from '../../../../src/ol/style/Style.js';
import Stroke from '../../../../src/ol/style/Stroke.js';

describe('ol.rendering.style.Text', function() {

  let map, vectorSource;

  function createMap(renderer, opt_pixelRatio) {
    const pixelRatio = opt_pixelRatio || 1;
    vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    map = new Map({
      pixelRatio: pixelRatio,
      target: createMapDiv(200 / pixelRatio, 200 / pixelRatio),
      renderer: renderer,
      layers: [vectorLayer],
      view: new View({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });
  }

  afterEach(function() {
    if (map) {
      disposeMap(map);
      map = null;
    }
  });

  describe('#render', function() {

    function createFeatures(opt_scale) {
      const scale = opt_scale || 1;
      let feature;
      feature = new Feature({
        geometry: new Point([-20, 18])
      });
      feature.setStyle(new Style({
        text: new Text({
          scale: scale,
          text: 'hello',
          font: '10px sans-serif'
        })
      }));
      vectorSource.addFeature(feature);

      feature = new Feature({
        geometry: new Point([-10, 0])
      });
      feature.setStyle(new Style({
        text: new Text({
          scale: scale,
          text: 'hello',
          fill: new Fill({
            color: 'red',
            font: '12px sans-serif'
          }),
          stroke: new Stroke({
            color: '#000',
            width: 3
          })
        })
      }));
      vectorSource.addFeature(feature);

      feature = new Feature({
        geometry: new Point([20, 10])
      });
      feature.setStyle(new Style({
        text: new Text({
          scale: scale,
          rotateWithView: true,
          text: 'hello',
          font: '10px sans-serif',
          stroke: new Stroke({
            color: [10, 10, 10, 0.5]
          })
        })
      }));
      vectorSource.addFeature(feature);
    }

    const nicePath = [
      20, 33, 40, 31, 60, 30, 80, 31, 100, 33, 120, 37, 140, 39, 160, 40,
      180, 39, 200, 37, 220, 33, 240, 31, 260, 30, 280, 31, 300, 33
    ];
    const uglyPath = [163, 22, 159, 30, 150, 30, 143, 24, 151, 17];
    const polygon = [151, 17, 163, 22, 159, 30, 150, 30, 143, 24, 151, 17];

    function createLineString(coords, textAlign, maxAngle, strokeColor, strokeWidth, scale) {
      let geom = new LineString();
      geom.setFlatCoordinates('XY', coords);
      let style = new Style({
        stroke: new Stroke({
          color: 'red'
        }),
        text: new Text({
          text: 'Hello world',
          font: 'bold 14px sans-serif',
          scale: scale || 1,
          textAlign: textAlign,
          maxAngle: maxAngle,
          placement: 'line',
          stroke: new Stroke({
            color: strokeColor || 'white',
            width: strokeWidth
          })
        })
      });
      let feature = new Feature(geom);
      feature.setStyle(style);
      vectorSource.addFeature(feature);

      geom = geom.clone();
      geom.translate(0, 5);
      feature = new Feature(geom);
      style = style.clone();
      style.getText().setTextBaseline('top');
      feature.setStyle(style);
      vectorSource.addFeature(feature);

      geom = geom.clone();
      geom.translate(0, -10);
      feature = new Feature(geom);
      style = style.clone();
      style.getText().setTextBaseline('bottom');
      feature.setStyle(style);
      vectorSource.addFeature(feature);

      map.getView().fit(vectorSource.getExtent());
    }

    it('tests the canvas renderer without rotation', function(done) {
      createMap('canvas');
      createFeatures();
      expectResemble(map, 'rendering/ol/style/expected/text-canvas.png', IMAGE_TOLERANCE, done);
    });

    it('tests the canvas renderer with rotation', function(done) {
      createMap('canvas');
      createFeatures();
      map.getView().setRotation(Math.PI / 7);
      expectResemble(map, 'rendering/ol/style/expected/text-rotated-canvas.png', IMAGE_TOLERANCE, done);
    });

    it('renders correct stroke with pixelRatio != 1', function(done) {
      createMap('canvas', 2);
      createFeatures();
      expectResemble(map, 'rendering/ol/style/expected/text-canvas-hidpi.png', 2.9, done);
    });

    it('renders text correctly with scale != 1', function(done) {
      createMap('canvas');
      createFeatures(3);
      expectResemble(map, 'rendering/ol/style/expected/text-canvas-scale.png', 6, done);
    });

    it('renders multiline text with alignment options', function(done) {
      createMap('canvas');
      let feature;
      feature = new Feature(new Point([25, 0]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world\nleft',
          font: 'bold 14px sans-serif',
          textAlign: 'left'
        })
      }));
      vectorSource.addFeature(feature);
      feature = new Feature(new Point([-25, 0]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world\nright',
          font: 'bold 14px sans-serif',
          textAlign: 'right'
        })
      }));
      vectorSource.addFeature(feature);
      feature = new Feature(new Point([0, 25]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world\nbottom',
          font: 'bold 14px sans-serif',
          textBaseline: 'bottom'
        })
      }));
      vectorSource.addFeature(feature);
      feature = new Feature(new Point([0, -25]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'top\nHello world',
          font: 'bold 14px sans-serif',
          textBaseline: 'top'
        })
      }));
      vectorSource.addFeature(feature);
      expectResemble(map, 'rendering/ol/style/expected/text-align-offset-canvas.png', 6, done);
    });

    it('renders multiline text with positioning options', function(done) {
      createMap('canvas');
      let feature;
      feature = new Feature(new Point([0, 0]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world\nleft',
          font: 'bold 14px sans-serif',
          textAlign: 'left',
          offsetX: 25
        })
      }));
      vectorSource.addFeature(feature);
      feature = new Feature(new Point([0, 0]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world\nright',
          font: 'bold 14px sans-serif',
          textAlign: 'right',
          offsetX: -25
        })
      }));
      vectorSource.addFeature(feature);
      feature = new Feature(new Point([0, 0]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world\nbottom',
          font: 'bold 14px sans-serif',
          textBaseline: 'bottom',
          offsetY: -25
        })
      }));
      vectorSource.addFeature(feature);
      feature = new Feature(new Point([0, 0]));
      feature.setStyle(new Style({
        text: new Text({
          text: 'top\nHello world',
          font: 'bold 14px sans-serif',
          textBaseline: 'top',
          offsetY: 25
        })
      }));
      vectorSource.addFeature(feature);
      expectResemble(map, 'rendering/ol/style/expected/text-align-offset-canvas.png', 6, done);
    });

    it('renders text along a MultiLineString', function(done) {
      createMap('canvas');
      let line = new LineString();
      line.setFlatCoordinates('XY', nicePath);
      const geom = new MultiLineString(null);
      geom.appendLineString(line);
      line = line.clone();
      line.translate(0, 50);
      geom.appendLineString(line);
      line = line.clone();
      line.translate(0, -100);
      geom.appendLineString(line);
      const feature = new Feature(geom);
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world',
          placement: 'line',
          font: 'bold 30px sans-serif'
        })
      }));
      vectorSource.addFeature(feature);
      map.getView().fit(vectorSource.getExtent());
      expectResemble(map, 'rendering/ol/style/expected/text-multilinestring.png', 7, done);
    });

    it('renders text along a Polygon', function(done) {
      createMap('canvas');
      const geom = new Polygon(null);
      geom.setFlatCoordinates('XY', polygon, [polygon.length]);
      const feature = new Feature(geom);
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world',
          font: 'bold 24px sans-serif',
          placement: 'line',
          overflow: true
        })
      }));
      vectorSource.addFeature(feature);
      map.getView().fit(vectorSource.getExtent());
      expectResemble(map, 'rendering/ol/style/expected/text-polygon.png', IMAGE_TOLERANCE, done);
    });

    it('renders text along a MultiPolygon', function(done) {
      createMap('canvas');
      let geom = new Polygon(null);
      geom.setFlatCoordinates('XY', polygon, [polygon.length]);
      const multiPolygon = new MultiPolygon(null);
      multiPolygon.appendPolygon(geom);
      geom = geom.clone();
      geom.translate(0, 30);
      multiPolygon.appendPolygon(geom);
      geom = geom.clone();
      geom.translate(0, -60);
      multiPolygon.appendPolygon(geom);
      const feature = new Feature(multiPolygon);
      feature.setStyle(new Style({
        text: new Text({
          text: 'Hello world',
          font: 'bold 24px sans-serif',
          placement: 'line',
          overflow: true
        })
      }));
      vectorSource.addFeature(feature);
      map.getView().fit(vectorSource.getExtent());
      expectResemble(map, 'rendering/ol/style/expected/text-multipolygon.png', 4.4, done);
    });

    it('renders text background', function(done) {
      createMap('canvas');
      createFeatures();
      const features = vectorSource.getFeatures();
      features[0].getStyle().getText().setBackgroundFill(new Fill({
        color: 'red'
      }));
      features[1].getStyle().getText().setBackgroundFill(new Fill({
        color: 'red'
      }));
      features[1].getStyle().getText().setBackgroundStroke(new Stroke({
        color: 'blue',
        width: 3
      }));
      features[2].getStyle().getText().setBackgroundFill(new Fill({
        color: 'red'
      }));
      features[2].getStyle().getText().setBackgroundStroke(new Stroke({
        color: 'blue',
        width: 3
      }));
      features[2].getStyle().getText().setPadding([5, 10, 15, 0]);
      map.getView().fit(vectorSource.getExtent());
      map.once('postrender', function() {
        expect(map.getFeaturesAtPixel([178, 120])).to.have.length(1);
      });
      expectResemble(map, 'rendering/ol/style/expected/text-background.png', IMAGE_TOLERANCE, done);
    });

    describe('Text along an ugly upside down path, keep text upright', function() {

      it('renders text along a linestring with auto-align', function(done) {
        createMap('canvas');
        createLineString(uglyPath);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-auto.png', 3.6, done);
      });

      it('renders text along a linestring with `textAlign: \'center\'`', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'center');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-center.png', 3.6, done);
      });

      it('omits text along a linestring with `textAlign: \'left\'` when > maxAngle', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'left');
        vectorSource.getFeatures()[0].getStyle().getText().setTextAlign('left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-omit.png', IMAGE_TOLERANCE, done);
      });

      it('omits text along a linestring with `textAlign: \'right\'` when > maxAngle', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'right');
        vectorSource.getFeatures()[0].getStyle().getText().setTextAlign('left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-omit.png', IMAGE_TOLERANCE, done);
      });

      it('renders text along a linestring with `textAlign: \'left\'` and no angle limit', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'left', Infinity);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-left.png', 3.5, done);
      });

    });

    describe('Text along a nice path', function() {

      it('renders text along a linestring', function(done) {
        createMap('canvas');
        createLineString(nicePath);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice.png', 2.8, done);
      });

      it('uses correct font with different styles', function(done) {
        createMap('canvas');
        createLineString(nicePath);
        map.getView().setResolution(0.25);
        vectorSource.getFeatures()[0].getStyle().getText().setFont('18px monospace');
        vectorSource.getFeatures()[1].getStyle().getText().setFont('italic 38px serif');
        vectorSource.getFeatures()[1].getStyle().getText().setTextBaseline('middle');
        vectorSource.getFeatures()[2].getStyle().getText().setTextBaseline('middle');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice-multi-font.png', 7.54, done);
      });

      it('renders text along a linestring with scale != 1', function(done) {
        createMap('canvas');
        createLineString(nicePath, undefined, undefined, undefined, undefined, 2);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice-scale.png', 8, done);
      });

      it('aligns text along a linestring correctly with `textBaseline` option', function(done) {
        createMap('canvas');
        createLineString(nicePath, undefined, undefined, 'cyan', 3);
        map.getView().setResolution(0.25);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice-baseline.png', 6.2, done);
      });

      it('renders text along a linestring with `textAlign: \'left\'`', function(done) {
        createMap('canvas');
        createLineString(nicePath, 'left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-left-nice.png', 2.8, done);
      });

      it('renders text along a rotated linestring', function(done) {
        createMap('canvas');
        map.getView().setRotation(Math.PI);
        createLineString(nicePath);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice-rotated.png', 4.5, done);
      });

      it('renders text along a rotated linestring with `textAlign: \'left\'`', function(done) {
        createMap('canvas');
        map.getView().setRotation(Math.PI);
        createLineString(nicePath, 'left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-left-nice-rotated.png', 4.5, done);
      });

    });

    where('WebGL').it('tests the webgl renderer without rotation', function(done) {
      createMap('webgl');
      createFeatures();
      expectResemble(map, 'rendering/ol/style/expected/text-webgl.png', 1.8, done);
    });

    where('WebGL').it('tests the webgl renderer with rotation', function(done) {
      createMap('webgl');
      createFeatures();
      map.getView().setRotation(Math.PI / 7);
      expectResemble(map, 'rendering/ol/style/expected/text-rotated-webgl.png', 1.8, done);
    });

  });
});
