var gamejs = require('gamejs');
var mrpas = require('./mrpas');
var vec = gamejs.utils.vectors;
// gamejs.preload([]);

var VISION_RANGE = 10;
var WORLD_SIZE = [60, 40]; // in tiles
var TILE_WIDTH = 15;
var HALF_WIDTH = parseInt(TILE_WIDTH/2);
var SIZE_PX = vec.multiply(WORLD_SIZE, TILE_WIDTH);

gamejs.ready(function() {
    var display = gamejs.display.setMode(SIZE_PX);
    
    var map = new mrpas.Map(WORLD_SIZE);
    
    var redraw = true;

    //randomize some walls
    map.iter(function(pos, tile){
            if(Math.random()<0.2) tile.wall = true;        
    });
    
    //player is in the middle
    var player_pos = [parseInt(WORLD_SIZE[0]/2), parseInt(WORLD_SIZE[1]/2)];
    map.tiles[player_pos[0]][player_pos[1]].wall = false;
    
    mrpas.compute(map, player_pos, VISION_RANGE);
    
    function move_player(x, y){
        var new_pos = vec.add(player_pos, [x, y]);
        //collision!
        var dest_tile =  map.get_tile(new_pos);
        if(dest_tile && !dest_tile.wall){
            player_pos = new_pos;
            mrpas.compute(map, player_pos, VISION_RANGE);
            redraw = true;
        }
    }
    
    function tick(msDuration) {
        
        if(redraw){
            display.fill('black');
            
            //draw only visible tiles: white for visible, brown for wall
            map.iter(function(pos, tile){
                if(tile.visible){
                    gamejs.draw.rect(display, tile.wall ? 'brown':'white',
                    new gamejs.Rect(vec.multiply(pos, TILE_WIDTH), [TILE_WIDTH, TILE_WIDTH]));
                }
            });
            
            //draw player as a circle
            var cpos = vec.add(vec.multiply(player_pos, TILE_WIDTH), [HALF_WIDTH, HALF_WIDTH]);
            gamejs.draw.circle(display, 'blue', cpos, HALF_WIDTH);
            redraw = false;
        }
        
        gamejs.event.get().forEach(function(event){
            
            //move player
            if(event.type==gamejs.event.KEY_DOWN){
                if(event.key == gamejs.event.K_UP) move_player(0, -1);
                else if(event.key == gamejs.event.K_DOWN) move_player(0, 1);
                else if(event.key == gamejs.event.K_LEFT) move_player(-1, 0);
                else if(event.key == gamejs.event.K_RIGHT) move_player(1, 0);
            } 
            //fill wall
            else if (event.type ==gamejs.event.MOUSE_DOWN){
                var pos = vec.divide(event.pos, TILE_WIDTH);
                var tile = map.get_tile(pos);
                if(tile){
                    tile.wall = !tile.wall;
                    redraw = true;
                    mrpas.compute(map, player_pos, VISION_RANGE);
                }
            }
        });
     
    };
    gamejs.time.interval(tick);
    
});
