<?php
/*******************************************************************************
*                                   IMPORTANT
* This script is not in the public domain. It is distributed with the GNU
* General Public License which lets you do pretty much anything you want with it
* but there are some restrictions -the most important of which is the fact that
* this script comes with ABSOLUTELY NO WARRANTY. Please read ./LICENSE for more
* information. Other than that, please feel free to modify the following in any
* way you please. If you think that you've improved it, let me know by creating
* a pull request on my GitHub, egefeyzioglu.
*
* Also, this script was created for Lock Bypass Village in DEFCON 28 SAFE MODE.
* Drop by our village the next time if you are interested in stuff like this, we
* have many more demos along these lines. Check us out at bypasvillage.org for
* more information.
*
* NB: Lock Bypass Village is allowed to distribute this product under a
*     different license than described in ./LICENSE ; granted the terms about
*     absolutely no warranty, and the terms about distributing the work under
*     the same license stay in the license they choose to distribute this work
*     under. IF YOU RECEIVED THIS WORK THROUGH THEM, THEIR LICENSE APPLIES.
*     
*                                                               -Ege Feyzioglu
*
*******************************************************************************/

  $t = "  ";

  $gridsize = array(
    'width' => 100,
    'height' => 43
  );

?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
	<title>Lock Bypass Village | Magnet Alarm Bypass Demo</title>
    <script>
      var width = <?php echo($gridsize['width']); ?>;
      var height = <?php echo($gridsize['height']); ?>;
    </script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="js/three.min.js"></script>
    <script type="module" src="js/GLTFLoader.js"></script>
    <script src="js/regex.js"></script>
    <script src="js/Vector.js" charset="utf-8"></script>
    <style>
      @font-face {
        font-family: Raleway;
        src: url("ttf/Raleway-VariableFont_wght.ttf");
        font-style: normal;
        font-weight: normal;
      }
      html{
        font-family: sans-serif;
      }

      a{
        color: inherit;
        text-decoration: none;
      }

      a:hover{
        text-decoration: underline;
      }

      div#info{
        border: 3pt solid black;
        padding: 1% 3%;
        position: fixed;
        top: -1%;
        left: -1%;
        height: 100vh;
        width: 15vw;
        z-index: 1;
        background-color: #15A14A;
        color: white;
      }

      div#info div#controls{
        position: fixed;
        bottom: 0;
        margin-bottom: 3%;
      }
      /* Door open slider */
        /* Chrome (and other Webkit) */
        div#info div#controls input{
          -webkit-appearance: none;
        }

        div#info div#controls input::-webkit-slider-runnable-track {
          width: 300px;
          height: 5px;
          background: white;
          border: none;
          border-radius: 10px;
        }
        div#info div#controls input::-webkit-slider-thumb {
          -webkit-appearance: none;
          border: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          margin-top: -5px;
        }
        div#info div#controls input:focus {
          outline: none;
        }

      div#debug{
        background-color: red;
        color: white;
        margin: 1%;
        padding: 1% 3%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1;

        display: none !important;
      }

      /* Firefox */

      div#info div#controls input{
        border: 1px solid white;
      }

      div#info div#controls input::-moz-range-thumb {
        border: 3px solid black;
        height: 16px;
        width: 16px;
        border-radius: 0;
        background: black;
      }

      div#info div#controls input:-moz-focusring{
        outline: 3px solid #15A14A;
        outline-offset: -1px;
      }
      div#info div#controls input:focus::-moz-range-track {
        background: white;
        height: 5px;
        border-radius: 10px;
      }

      div#view{
        width: 100%;
        height: 95vh;
      }

      canvas{
        display: block;
      }

      table#magnetic-field{
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.2);
        transform: rotate3d(0, 1, 0, 301.6899219deg);

        display: none !important; /*Disabled, not supported yet*/
      }
    </style>
  </head>
  <body>
    <div id="debug">
      <h3>Debug Information</h3>
      <div id="content"></div>
    </div>
    <div id="info">
      <img src="/LBV_C.png" style="width: 100%;">
      <h3>Magnet Alarm Bypass Demo</h3>
      <h4>Lock Bypass Village Grayhat 2020</h4>
      Use the WASD keys to move the stick around. When you think you have successfully disabled the alarm sensor, try opening the door.
      <div id="controls">
        <div id="text">
          <h3>Sensor Information</h3>
          Magnetic Field: <span id="By"></span><br/>
          Threshold: <span id="threshold"></span><br/>
          State: <span id="state"></state>
        </div>
        <label for="door-closedness"><a id="open-door" href=#>Open Door</a></label><br/>
        <label for="door-closedness"><a style="display: none;" id="close-door" href=#>Close Door</a></label><br/>
        <input id="door-closedness" type="range" min="2.71828183" max="122.790221" value="122.790221" step="0.00000001"> <!-- Unit is exp(exp(rad)). Will later be log'd in JS to make the beginning more sensitive -->
      </div>
    </div>
    <div id="view"></div> <!--Will contain the 3D view -->
    <table id="magnetic-field">
    <?php
      for ($y=0; $y < $gridsize['height']; $y++) {
        echo("$t$t<tr>");
        for ($x=0; $x < $gridsize['width']; $x++) {
          echo("<td id='needle-$x-$y'><img id='needle-$x-$y' width='15px' src='img/needle.png'/></td>");
        }
        echo("</tr>\n");
      }
     ?>
   </table>
  </body>
  <script type="module" src="js/magnet<?php if(isset($_GET['lvl']) && $_GET['lvl'] == '2') echo("-lvl2")?>.js" charset="utf-8"></script>
</html>
