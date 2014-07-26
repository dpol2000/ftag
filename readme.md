    
The ftag plugin enables tagging photos/images. The tags can be selected or inputted, tagged can be as persons as any other objects.
    
**Functionality and interface**

The plugin runs in two modes; *edit mode* and *show mode*.

In the *edit mode* full functionality is offered to user. After clicking on the image, user tags some area by changing the size of the tagged area. When finished, user clicks again, and a tag choice window appears right next to the tagged area. Basically, it is a table of persons or objects to be tagged, an input field where to anything can be typed, and the two buttons, Save and Close. After making a choice in the table or typing the desired tag text user clicks on the Save button, and a new tag appends to the image.

A tagged area has the title property with the tag's text; therefore it is shown any time user moves a mouse over it.

Tags themselves are shown in a separate area; when use moves a mouse over a tag, the tagged area on the image stays clear while a shadow covers the rest of the image.

Tags can be removed when user clicks on the icon or a text right near to the tag text.
   
In the *show mode* user can't add or remove tags.
    
**Basic usage**

To start the plugin's work, apply it to the image:
    
	$('<#image_id>').ftag(parameters);
    
Use only *id*, not *class*, and only one element. It makes no sense to use one set of parameters to many images, as some of the parameters must be unique to every image with a unique id).

If you need more copies of the plugin working on one page, apply the plugin to every *id* with different parameters:
        
    $('<#image1_id>').ftag(parameters1);
    $('<#image2_id>').ftag(parameters2);
    
If you want to change the parameters dynamically, just run the plugin again with new parameters:

    $('<#image_id>').ftag(old_parameters);
    ...
    $('<#image_id>').ftag(new_parameters);
    
**Parameters**
    
Obligatory parameters:
<table>
<tr>
<td>edit</td><td>boolean, defines if edit functions are availabe. If true, user can add and remove tags.</td>
</tr>
<tr>
<td>tagSelectWindow</td><td>the id of the select tag window</td>
</tr>
<tr>
<td>tagSelectWindowSave</td><td>the id of the select tag window 'save' button</td>
</tr>
<tr>
<td>tagSelectWindowClose</td><td>the id of the select tag window 'close' or 'cancel' button</td>
</tr>
<tr>
<td>tagTextInput</td><td>the id of the input element that holds the text of the chosen or inputted tag</td>
</tr>
<tr>
<td>tagValue</td><td>the id of the input element that holds the value of the chosen tag</td>
</tr>
<tr>
<td>tagsHolder</td><td>the id of the layer that contains tags on the window with image</td>
</tr>
</table>

Optional parameters: 
    
<table>
<tr>
<td>chosenObjectClass</td><td>name of the class(es) of the chosen object on the choice window</td>
</tr>
<tr>
<td>areaShowStyle</td><td>name of the class(es) the tag-areas on the image are wrapped</td>
</tr>
<tr>
<td>areaEditStyle</td><td>name of the class(es) the tag-areas on the image are wrapped</td>
</tr>
<tr>
<td>shadowStyle</td><td>name of the class(es) of the shadows</td>
</tr>
<tr>
<td>tagsStyle</td><td>name of the class(es) the tags are wrapped</td>
</tr>
<tr>
<td>tags</td><td>array of tags. Each element must contain id, objectid, title,	top, left, width, height. All these attributes can be strings; but top, left, width, height and id are transformed into numerals. Objectid is '0' for tags not connected to objects (label tags).</td>
</tr>
<tr>
<td>removeButtonClass</td><td>the class for remove icon right to the tag title</td>
</tr>
<tr>
<td>removeButtonText</td><td>the text for remove icon right to the tag title. If both removeButtonText and removeButtonClass are empty or undefined, '[x]' will be used with no style.</td> 
</tr>
<tr>
<td>onTagClick</td><td> the user function that fires when user clicks on the person/object tag. Not active on label tags. The objectid parameter of the tag is given to the user function.</td> 
</tr>
<tr>
<td>ontagSelectWindowShow</td><td> the user function that fires when the choice window is shown</td> 
</tr>
<tr>
<td>ontagSelectWindowClose</td><td> the user function that fires when the choice window is closed</td> 
</tr>
<tr>
</table>

If you don't specify the obligatory parameters, the plugin won't work. It logs the error in the console.
    
If you don't specify the optional parameters, defaults are used. The default styles are stored in the plugin as style strings, not classes, and are applied to the corresponding layers. See the example page to see the default styling (image 1).
    
Options are stored in the image jQuery object under the name '_ftag'. Basically, you don't have to deal with it directly.

**The tag choice and input window**
    
When user is finished with locating the tagged area, he clicks on the image the second time and gets a window where he can choose a person or an object from a list, or write something as a name. This window must be provided (see the example), the plugin doesn't create it, but only needs five ids: tagSelectWindow, tagSelectWindowSave, tagSelectWindowClose, tagTextInputInput, and tagValue. As well, chosenObjectClass can be specified, and it's really desirable for the sake of aesthetics.
    
If you want to have several copies of the plugin on one page, you must use different windows for every image id.

**Commands**

There are two commands; 'get' and 'stop'. Their usage is very simple:
    
    $('<#image_id>').ftag ('get');
    $('<#image_id>').ftag ('stop');
    
The 'get' command returns an array of the image's tags. The format of the elements is the same as for tags which can be loaded into the plugin. An element is an object with the following fields: id, objectid, title, top, left, width, and height. Top, left, width, and height are numerals, others are strings.
   
The 'stop' command unbinds the plugin's events except ones connected with shadows; i.e., it turns the plugin into show mode, with the 'edit' parameter set to false (but it keeps remove icons, only disables them).

**Contribution**

Any help is appreciated. Feel free to create issues and send pull requests.

**Lisence and copyright**
    
Copyright (c) 2014 Dmitry Polinichenko
    
MIT license, see license.txt.
        
