"use strict";
const imagePane = {
    toggle: true,
    defaults: {
        imageStyle: {
            right: '0',
            top: '200px',
            width: '400px',
            height: '400px',
            'background-color': '#ddd',
            border: '3px black solid',
        },
    }
};
(imagePane as any).defaultStyle = { position: 'fixed', display: 'block' };
// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ toggle: boolean; defaults: { i... Remove this comment to see the full error message
io.modulesToInit.push(imagePane);
(imagePane as any).init = function () {
    // First set up the HTMP page
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#quest-image').css((imagePane as any).defaultStyle);
    // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    $('#quest-image').css(settings.imageStyle);
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'imageStyle' does not exist on type '{ is... Remove this comment to see the full error message
    (settings as any).imageHeight = parseInt(settings.imageStyle.height);
    // @ts-expect-error ts-migrate(2551) FIXME: Property 'imageStyle' does not exist on type '{ is... Remove this comment to see the full error message
    (settings as any).imageWidth = parseInt(settings.imageStyle.width);
    // Set the default values for settings
    for (let key in imagePane.defaults) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!settings[key])
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            settings[key] = imagePane.defaults[key];
    }
};
// @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
(imagePane as any).hide = function () { $('#quest-image').hide(); };
// @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
(imagePane as any).show = function () { $('#quest-image').show(); };
// @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
commands.unshift(new Cmd('MetaImages', {
    script: function () {
        if ((settings as any).hideImagePane) {
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#quest-images').show();
            delete (settings as any).hideImagePane;
        }
        else {
            // @ts-expect-error ts-migrate(2581) FIXME: Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
            $('#quest-images').hide();
            (settings as any).hideImagePane = true;
        }
        (io as any).calcMargins();
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
        msg(lang.done_msg);
    },
}));
