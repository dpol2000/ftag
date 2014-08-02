
/*

    The ftag plugin enables tagging images. The tags can be selected or inputted.
    (c) 2014 Dmitry Polinichenko
    
    Parameters:

    obligatory: 
    
        edit:                   defines if edit functions are availabe. If true, user can add or remove tags.
        tagTextInputInput:      the id of the input element that holds the text of the chosen or inputted tag
        tagValue:               the id of the input element that holds the value of the chosen tag
        tagSelectWindow:        the id of the select tag window
        tagSelectWindowSave:    the id of the select tag window 'save' button
        tagSelectWindowClose:   the id of the select tag window 'close' or 'cancel' button
        tagsHolder:             the id of the area that contains tags on the window with image    
        
    optional: 

        chosenObjectClass:      name of the class(es) of the chosen object on the choice window
        areaShowStyle:          name of the class(es) the tag-areas on the image are wrapped
        areaEditStyle:          name of the class(es) the tag-areas on the image are wrapped
        shadowStyle:            name of the class(es) of the ftagShadows
        tagsStyle:              name of the class(es) the tags are wrapped
        tags:                   array of tags. Each element must contain id, objectid, title, top, left, width, height
        removeButtonClass:      the class for remove icon right to the tag title. 
        removeButtonText:       the text for remove icon right to the tag title. If both removeButtonText and removeButtonClass are empty or undefined, '[x]' will be used with no style
        onTagClick:             the function that fires when user clicks on the person tag. Not active on label tags.
        ontagSelectWindowShow:  the function that fires when the choice window is shown.
        ontagSelectWindowClose: the function that fires when the choice window is closed.
        

    command: 
    
        get: use this command to get all the tag information (to save it to a database, for example).
        
        stop: unbinds all events, so that the plugin is disabled.


*/

(function ($) {
    $.fn.ftag = function (options) {
        
        var clicked = false,    // if user has clicked
            stop = false,       // if user has clicked twice
            mx = 0,             // coordinates of the first click
            my = 0,
            cx = 0,             // current mouse coordinates
            cy = 0,

        // default styles and ids
            defaultTagsStyle = {border: '1px #229922 solid', 'border-radius': '5px', padding: '5px 7px 5px 7px', position: 'static', margin: '10px', 'background-color': '#88EE88', display: 'inline-block' },
            defaultAreaShowStyle = {border: '0', position: 'absolute', 'z-index': '9999', margin: '0', padding: '0'},
            defaultAreaEditStyle = {position: 'absolute', 'z-index': '9999', border: '2px solid #990000', width: '10px', height: '10px',  margin: '0', padding: '0'},
            defaultShadowStyle = {position: 'absolute', 'z-index': '9999', opacity: '0.5', 'background-color': '#777777',  margin: '0', padding: '0'},

            tagsAreaId = 'ftag',            // the id of the div layer that will wrap the image, without '#'
        // variables that use optional parameters. If the corresponding parameters are undefined, they will be empty
            staticParent = false,           // parent position style
            thisImage = $(this),            
            thisArea = null,                // the layer into which the image will be wrapped
            offset = $(this).offset(),      // offset
            position = $(this).position(),  // position
            ftagObject = null,
            i,                              // just a loop variable
            tag;                            

        if (!options) {
            console.log('Plugin error: No parameters');
            return null;
        }
    
        if (typeof options === 'string') { // the parameter is a command
        
            switch (options) {

            case 'stop': // stop all activity, i.e. unbind all events
                thisArea = thisImage.parent();
                // unbind all events, if they are present
                // events of the image
                thisArea.off('click');
                thisArea.unbind('mousemove');
            
                var data = thisImage.data('_ftag'),
                    options = data.options;        
    
                // event of removing a tag
                $(options.tagsHolder).off('click', '.tagClass .removeTag');
            
                // events of tag choice & input window
                $(options.tagSelectWindow + ' ' + options.tagSelectWindowSave).unbind('click');
                $(options.tagSelectWindow + ' ' + options.tagSelectWindowClose).unbind('click');
                return this;

            case 'get':  // get all tags data and return an array
                var data = thisImage.data('_ftag');
                var tags = data.options.tags;
                return tags;
            } // switch
            
        } else if (typeof options === 'object') { // the parameter is an options object

            // check all necessary parameters, if any is absent then leave a message on the console and return null  

                if (!options.tagSelectWindow) {
                    console.log('Plugin error: tagSelectWindow is not specified');
                    return null;
                }

                if (!options.tagSelectWindowSave) {
                    console.log('Plugin error: tagSelectWindowSave is not specified');
                    return null;
                }
                
                if (!options.tagSelectWindowClose) {
                    console.log('Plugin error: tagSelectWindowClose is not specified');
                    return null;
                }

                if (!options.tagTextInput) {
                    console.log('Plugin error: tagTextInput is not specified');
                    return null;
                }

                if (!options.tagValue) {
                    console.log('Plugin error: tagValue is not specified');
                    return null;
                }
                
                if (!options.tagsHolder) {
                    console.log('Plugin error: tagHolder is not specified');
                    return null;
                }

                // options now holds incoming parameters and defaults
                var options = $.extend({}, $.fn.ftag.defaults, options || {} );

                // user-given layers must contain id of the image
                $(options.tagSelectWindowSave).attr('imageId', thisImage.attr('id'));
                $(options.tagsHolder).attr('imageId', thisImage.attr('id'));

                // check if the plugin is already running on this image
                var data = $(this).data('_ftag');
                
                // if it is, change its options
                if (data) {
                    data.options = options;
                } else { // otherwise save options data to the jquery object
                    ftagObject = new ftag(options, thisImage);
                    thisImage.data('_ftag', ftagObject);
                }                    

                // if the image is already wrapped
                if (thisImage.parent().attr('id') === (tagsAreaId + '-' + thisImage.attr('id'))) {
                    // remove all existing labels and shadows
                    thisImage.parent().find('.areaClass').remove();
                    thisImage.parent().find('.ftagShadow').remove();
                } else {
                    // wrap the image
                    thisImage.wrap('<div id="' + tagsAreaId + '-' + thisImage.attr('id') + 
                    '" style="display: inline-block; padding:0; margin:0; position: relative;"></div>');
                }

                thisArea = thisImage.parent();
                thisArea.css({
                    width: thisImage.css('width'),
                });

                // remove all existing tags, if they are present
                $(options.tagsHolder).empty();

                // unbind all events, if they are present
                // events of the image
                thisArea.unbind('click');
                thisArea.unbind('mousemove');
                // events of tags
                $(options.tagsHolder).off('mouseenter', '.tagClass');
                $(options.tagsHolder).off('mouseleave', '.tagClass');
                $(options.tagsHolder).off('click', '.tagClass');
                // events of tag choice & input window
                $(options.tagSelectWindow + ' ' + options.tagSelectWindowSave).unbind('click');
                $(options.tagSelectWindow + ' ' + options.tagSelectWindowClose).unbind('click');

                // append existing tags if we have them
                for (i = 0; i !== options.tags.length; i++) {

                    // append a tag
                    tag = createTag(options.tags[i].id, options.tags[i].objectid, options.tags[i].title, options);
                    $(options.tagsHolder).append(tag);

                    // apply styles to the tag
                    applyParameters('.tagClass[id="' + options.tags[i].id + '"]', options.tagsStyle, defaultTagsStyle);

                    // append corresponding area on the image
                    thisArea.prepend('<div class="areaClass" id="' + options.tags[i].id + '" objectid="' + options.tags[i].objectid +  '" title="' + options.tags[i].title + '"></div>');

                    // appy styles to the area
                    applyParameters('div.areaClass[id="' + options.tags[i].id + '"]', options.areaShowStyle, defaultAreaShowStyle);

                    position = thisImage.position();
                    
                    // apply sizes to the area and turn relative coordinates into absolute
                    thisArea.children('div.areaClass[id="' + options.tags[i].id + '"]').css({
                        width: parseInt(options.tags[i].width, 10) + 'px',
                        height: parseInt(options.tags[i].height, 10) + 'px',
                        top: parseInt(options.tags[i].top, 10) + position.top - $(window).scrollTop() + 'px',
                        left: parseInt(options.tags[i].left, 10) + position.left + 'px'
                    });
                }
                
                // add events to handle existing and future tags

                // remove tag event handler; user clicks on the [x] button
                $(options.tagsHolder).on('click', '.tagClass .removeTag', function () { //  
                    
                    var id = $(this).parent().attr('id'),
                        $tagsHolder = $(this).parent().parent(),
                        imageId = $tagsHolder.attr('imageId'),
                        thisImage = $('#'+imageId),
                        data = thisImage.data('_ftag'),
                        options = data.options;
                    
                    // remove the tag
                    $tagsHolder.children('.tagClass[id="' + id + '"]').remove();

                    // remove the shadows
                    $('.ftagShadow').remove();

                    // remove the tagged area
                    thisImage.parent().children('.areaClass[id="' + id + '"]').remove();
                    
                    // remove tag info from the jquery object
                    for (i = 0; i !== options.tags.length; i++) {
                        if (options.tags[i].id == id) {
                            options.tags.splice(i, 1);
                            break;
                        }
                    }

                    // check for errors
                    if ( thisImage.parent().children('.areaClass[id="' + id + '"]') > 0) {
                        console.log('Error: not all tagged areas have been removed');
                    }

                });

                // add events with shadows

                // create shadows on mouseenter
                $(options.tagsHolder).on('mouseenter', '.tagClass', function () { // 

                    var imageId = $(this).parent().attr('imageId'),
                        thisImage = $('#'+imageId),
                        data = $('#'+imageId).data('_ftag'),
                        options = data.options,
                        thisArea = thisImage.parent(),
                        area = thisArea.children('.areaClass[id="' + $(this).attr('id') + '"]'),
                        position = thisImage.position(),
                        border = 0;

                    
                    if (options.areaShowStyle) { // take into consideration border width of the tagged area
                        border = Math.ceil(parseFloat(area.css('border-width'), 10));
                    }
                    
                    createShadow(
                        thisArea,
                        data.options,
                        defaultShadowStyle,
                        { top: parseInt(area.css('top'), 10) + border,
                        left: parseInt(area.css('left'), 10) + border,
                        width: parseInt(area.css('width'), 10),
                        height: parseInt(area.css('height'), 10),
                        imageWidth: parseInt(thisImage.css('width'), 10),
                        imageHeight: parseInt(thisImage.css('height'), 10)},
                        Math.ceil(position.left),
                        Math.ceil(position.top)
                        );

                });

                // remove shadows on mouseleave
                $(options.tagsHolder).on('mouseleave', '.tagClass', function () { // 
                    thisArea.children('.ftagShadow').remove();
                });

                // if we are in the show mode, exit, as we don't need other event handlers
                if (options.edit !== true) {
                    return this;
                }
                
                // append a new tag when user clicks Save button
                $(options.tagSelectWindow + ' ' + options.tagSelectWindowSave).click(function () { 

                    var imageId = $(this).attr('imageId'),
                        data = $('#'+imageId).data('_ftag'),
                        options = data.options,
                        position =  $('#'+imageId).position(),
//                        offset = $('#'+imageId).offset(),
                        thisArea = $('#'+imageId).parent(),
                        title = $(options.tagTextInput).val(),
                        objectId = $(options.tagValue).val(),
                        area = thisArea.children('.areaClass.new');

                    // if user input is empty, don't save anything
                    if (title === '') {
                        return;
                    }
                    
                    // hide tags choice and input window
                    $(options.tagSelectWindow).hide();

                    stop = false;
                    clicked = false;
                    
                    // remove edit style from the area and apply show style
                    if (options.areaEditStyle) {
                        area.removeClass(options.areaEditStyle);
                    }
                    applyParameters(area, options.areaShowStyle, defaultAreaShowStyle);
                    
                    // calculate the id of the new tag
                    var newTagId = 0;
                    for (i = 0; i !== options.tags.length; i++) {
                        if (parseInt(options.tags[i].id, 10) > newTagId) {
                            newTagId = options.tags[i].id;
                        }
                    }
                    
                    newTagId++;
                    
                    // add tag information to the area
                    area.attr({
                        title: title,
                        objectid: objectId,
                        id: newTagId
                    });
                    
                    var top = Math.ceil(parseInt(area.css('top'), 10) - position.top);
                    
                    // save the new tag info into the object with old coordinates
                    options.tags.push({'title': area.attr('title'),
                        'objectid': area.attr('objectid'),
                        'id': area.attr('id'),
                        'left': Math.ceil(parseInt(area.css('left'), 10) - position.left),
                        'top': top,
                        'width': parseInt(area.css('width'), 10),
                        'height': parseInt(area.css('height'), 10)
                    });
                    
                    // create and append the new tag on the window                    
                    
                    var tag = createTag(newTagId, objectId, title, options);
                                        
                    $(options.tagsHolder).append(tag);
                    
                    applyParameters(options.tagsHolder + ' .tagClass[id="' + newTagId + '"]', options.tagsStyle, defaultTagsStyle);

                    // refresh the tags choice window
                    if (options.chosenObjectClass) {
                        $("." + options.chosenObjectClass).removeClass(options.chosenObjectClass);
                    }
                    $(options.tagTextInput).val('');
                    $(options.tagValue).val('0');

                    //run the user function
                    if (options.ontagSelectWindowClose) {
                        options.ontagSelectWindowClose();
                    }
                    
                    // get rid of the new class
                    thisArea.children('.areaClass.new').removeClass('new');
                });
                
                // user clicks Close button; tag choice window is closed
                $(options.tagSelectWindowClose).click(function () { 
                    
                    // hide the window
                    $(options.tagSelectWindow).hide();

                    // remove highlight of the chosen tag
                    if (options.chosenObjectClass) {
                        $("." + options.chosenObjectClass).removeClass(options.chosenObjectClass);
                    }

                    // set input field and value to default
                    $(options.tagTextInput).val('');
                    $(options.tagValue).val('0');
                    
                    // remove the area
                    thisArea.children('.areaClass.new').remove();
                    
                    stop = false;
                    clicked = false;
                    
                    // run user-defined function
                    if (options.ontagSelectWindowClose) {
                        options.ontagSelectWindowClose();
                    }

                });

                // user clicks on the image
                thisArea.click (function (e) {
                    
                    var coeffX,
                        coeffy;
                    
                    if (!stop) { //if user has not clicked twice yet

                        var thisArea =  $(this),
                            thisImage = thisArea.children('img').first(),
                            offset = thisImage.offset(),
                            position = thisImage.position(),
                            data = thisImage.data('_ftag'),
                            options = data.options,
                            imageWidth, 
                            imageHeight;
                        
/*                        if (getPositionStyle(thisArea.parent()).css('position') === 'static') {
                            staticParent = true;
                            coeffX = Math.ceil(offset.left);
                            coeffY = Math.ceil(offset.top);
                        } else {*/
                            coeffX = Math.ceil(position.left);
                            coeffY = Math.ceil(position.top);
//                        }
                        
                        if (clicked) { // if user has already clicked once

                            stop = true;

                            // show tag choice & input window
                            $(options.tagSelectWindow).css({
                                "position": "absolute", 
                                "z-index": "10000", 
                                "top": my + offset.top - coeffY + "px", 
                                "left": cx + offset.left - coeffX + 20 + "px"
                            });
                                
                            $(options.tagSelectWindow).show();

                            // run the user-defined function
                            if (options.ontagSelectWindowShow) {
                                options.ontagSelectWindowShow();
                            }
                        } else { // this is the first click

                            // get image width & height
                            imageWidth = parseInt(thisImage.css('width'), 10);
                            imageHeight = parseInt(thisImage.css('height'), 10);

                            // append a tagged area & apply parameters
                            thisArea.prepend('<div class="areaClass new" style="position: absolute;"></div>');
                            applyParameters('div.areaClass.new', options.areaEditStyle, defaultAreaEditStyle);

                            // get mouse coordinates
                            mx = Math.ceil(e.pageX);
                            my = Math.ceil(e.pageY);

                            // correct coordinates if needed
//                            if (!staticParent) {
                                mx = mx - offset.left + coeffX;
                                my = my - offset.top + coeffY;
//                            }
                            
                            // get tagged area and set its style
                            thisArea.children('.areaClass.new').css({
                                left: mx + 'px',
                                top: my + 'px'
                            });

                            clicked = true;

                            // mousemove event handler for drawing a tag area
                            thisArea.mousemove(function (e) {

                                var thisArea = $(this),
                                    taggedArea = thisArea.children('.areaClass.new');
                                
                                if (!stop && clicked) { // if user has already clicked once but not twice

                                    var offset = thisArea.children('img').first().offset(),
                                        position = thisArea.children('img').first().position();

                                    // set mouse coordinates and coefficients depending on styles
/*                                    if (getPositionStyle(thisArea.parent()).css('position') === 'static') {
                                        coeffX = Math.ceil(offset.left);
                                        coeffY = Math.ceil(offset.top); //Math.ceil(offset.top);
                                        cx = Math.ceil(e.pageX - offset.left); // + position.left);
                                        cy = Math.ceil(e.pageY - offset.top); //+ position.top);
                                    } else {*/
                                        coeffX = Math.ceil(position.left);
                                        coeffY = Math.ceil(position.top);
                                        cx = Math.ceil(e.pageX - offset.left + position.left);
                                        cy = Math.ceil(e.pageY - offset.top + position.top);
                                    //}
                                    
                                    // if coordinates are inside the image
                                    if ((cx > coeffX) && (cx < imageWidth + coeffX) && (cy > coeffY) && (cy < imageHeight + coeffY)) {

                                        // change its boundaries according to mouse coordinates
                                        if (cx < mx) {
                                            taggedArea.css('left', cx + 'px');
                                            taggedArea.css('width', (mx - cx) + 'px');
                                        } else {
                                            taggedArea.css('left', mx + 'px');
                                            taggedArea.css('width', (cx - mx) + 'px');
                                        }

                                        if (cy < my) {
                                            taggedArea.css('top', cy + 'px');
                                            taggedArea.css('height', (my - cy) + 'px');
                                        } else {
                                            taggedArea.css('top', my + 'px');
                                            taggedArea.css('height', (cy - my) + 'px');
                                        }
                                    }
                                }

                            });

                        }

                    }

                });
        }

        // the function returns a tag layer
        function createTag(tagId, objectId, title, options) {

            var tag;

            if (objectId === '0') {
                tag = '<div class="tagClass" id="' + tagId + '" objectid="' + objectId + '">' + title;
            }
            else {
                tag = '<div class="tagClass" id="' + tagId + '" objectid="' + objectId + '"><span';
                
                if (options.onTagClick) {
                    tag = tag + ' onclick="' + options.onTagClick + '(' + objectId + ')">' + title + '</span>';
                } else {
                    tag = tag + '>' + title + '</span>';

                }
            }

            if (options.edit === true) {
                tag = tag + '&nbsp;&nbsp;<span class="removeTag ' + options.removeButtonClass + '">';
                
                if ((options.removeButtonClass === '') && (options.removeButtonText === '')) {
                    tag = tag + '[x]</span>';
                } else {
                    tag = tag + options.removeButtonText + '</span>';
                }
            }

            tag = tag + '</div>';
            
            return tag;
        }

        return this;
    };

        // the function appends shadow on the image, excluding the specified tagged area
        function createShadow(thisArea, options, defaultShadowStyle, data, coeffX, coeffY) {

            // append empty layers
            thisArea.prepend('<div class="ftagShadow" id="ftagShadow1"></div>');
            thisArea.prepend('<div class="ftagShadow" id="ftagShadow2"></div>');
            thisArea.prepend('<div class="ftagShadow" id="ftagShadow3"></div>');
            thisArea.prepend('<div class="ftagShadow" id="ftagShadow4"></div>');

            // make the layers shadows
            applyParameters('.ftagShadow', options.shadowStyle, defaultShadowStyle);

            // shadow over the tagged area
            $('#ftagShadow1').css({
                'width': data.imageWidth + 'px',
                'height': data.top - coeffY + 'px',
                'top': coeffY + 'px',
                'left': coeffX + 'px'
            });
            // shadow on the left
            $('#ftagShadow2').css({
                'width': data.left - coeffX + 'px',
                'height': data.height + 'px',
                'top': data.top,
                'left': coeffX + 'px'
            });
            // shadow on the right
            $('#ftagShadow3').css({
                'width': (data.imageWidth - data.width - data.left + coeffX) + 'px',
                'height': data.height + 'px',
                'top': data.top,
                'left': (data.left + data.width) + 'px'
            });
            // shadow under the tagged area
            $('#ftagShadow4').css({
                'width': data.imageWidth + 'px',
                'height': (data.imageHeight + coeffY - data.top - data.height) + 'px',
                'top': data.top + data.height + 'px',
                'left': coeffX + 'px'
            });
        }    
    
    
    // the function applies a user class or the default css style to the element(s)
    function applyParameters (elem, param, defaultParam) {

        if (param) {
            $(elem).addClass(param);
        } else {
            $(elem).css(defaultParam);
        }
    }

    // The function returns the first parent element of the argument, 
    // that has non-static position; if such doesn't exist, it returns 
    // a child of BODY
    function getPositionStyle(elem) {

        var element = elem;

        while ((element.css('position') === 'static') || (element.css('position') === undefined)) {

            if (element.parent().prop('tagName') === 'BODY') {
                break;
            }
            element = element.parent();
        }

        return element;
    }

    // function appending options data to image object
    function ftag(options) {
        this.options = options;
        return this;
    }

    // default options
    $.fn.ftag.defaults = {
        edit: true,
        removeButtonClass: '',
        removeButtonText: '',
        onTagClick: '',
        tags: []
    };

}(jQuery));