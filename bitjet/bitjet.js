define(function(require) {
   var widget = require("widgets/js/widget");

   var BinaryModel = widget.WidgetModel.extend({
     initialize: function() {
       this.on('change:data', this._decode, this);
     },

     _decode: function() {
       var msg = this.get("data");
       this.set('_data', atob(msg['b64data']));
     }
   });

   var BinaryView = widget.DOMWidgetView.extend({
       render: function() {
           
           // Create the viewing frame.
           this.$frame = $('<canvas/>')
               .height(800)
               .width(800)
               .css({
                   overflow: 'hidden',
                   border: '1px solid lightgray',
                   "-webkit-box-shadow": "0 0 12px 1px rgba(87,87,87,0.2)",
                   "box-shadow": "0 0 12px 1px rgba(87,87,87,0.2)",
                   background: "rgba(87,87,87,0.2)"
               }).appendTo(this.$el);

           this.$frame[0].width = this.$frame.width()
           this.$frame[0].height = this.$frame.height()

           this.model.on('change:_data', this._redraw, this);
           this.model.on('change:datawidth', this._redraw, this);
           this.model.on('change:palette', this._redraw, this);
           this.model.on('change:blockwidth', this._redraw, this);
           this.model.on('change:blockheight', this._redraw, this);
           this._redraw();
       }
   });

   var BitView = BinaryView.extend({
       _redraw: function() {
          var data = this.model.get('_data');
          
          // Grab the canvas context
          var canvas = this.$frame[0];
          var context = canvas.getContext("2d");

          // Color the background gray
          context.fillStyle = "rgb(87,87,87,0.2)";
          context.clearRect(0, 0, canvas.width, canvas.height );

          var bitwidth = this.model.get("datawidth");

          var width = this.model.get("blockwidth");
          var height = this.model.get("blockheight");

          // Paint the canvas with our bit view
          for(var idx=0; idx < data.length; idx++) {
            // The decoded data is a string in JavaScript land, we'll strip uint8s off
            var el = data.charCodeAt(idx);
            var charsize = 8; 

            for (i=0; i<charsize; i++){
              //Mask off that first bit
              var bit = (el >> 7-i) & 0x1; // shift down from the leftmost bit
              
              // Where does this bit fit in it?
              var x = ((idx*charsize+i) % bitwidth)*width;
              var y = (Math.floor((idx*charsize+i)/bitwidth))*height;

              if(bit) { //on
                context.fillStyle = "rgb(255,255,255)";
                context.fillRect(x,y,width,height);
              } else {
                context.fillStyle = "rgb(0,0,0)";
                context.fillRect(x,y,width,height);
              }

            }
              
          }

       },
   });

   var ByteView = BinaryView.extend({

       _redraw: function() {
          var data = this.model.get('_data');

          // Grab the canvas context
          var canvas = this.$frame[0];
          var context = canvas.getContext("2d");

          // Color the background gray
          context.fillStyle = "rgb(87,87,87,0.2)";
          context.clearRect(0, 0, canvas.width, canvas.height );

          var bytewidth = this.model.get("datawidth");

          var width = this.model.get("blockwidth");
          var height = this.model.get("blockheight");
           
          // We'll assume a 256 long palette for now, quiet barf otherwise
          var palette = this.model.get("palette");
          console.log("Palette from model:");
          console.log(palette);
          window.patty = palette;
          if (palette && palette.length != 256) {
              palette = undefined;
          }


          // Paint the canvas with our byte view
          for(var idx=0; idx < data.length; idx++) {
            // The decoded data is a string in JavaScript land, we'll strip uint8s off
            var el = data.charCodeAt(idx);

            // Where does this byte get painted?
            var x = (idx % bytewidth)*width;
            var y = (Math.floor(idx/bytewidth))*height;

            context.fillStyle = "rgb(" +  [el,el,el].join() + ")"
            context.fillRect(x,y,width,height);
              
          }

       },
   });

   return {
       BitView: BitView,
       ByteView: ByteView,
       BinaryView: BinaryView,
       BinaryModel: BinaryModel
   };
});
