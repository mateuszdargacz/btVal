/**
 __author__ = 'mateuszdargacz@gmail.com'
 __date__ = '4/19/16 / 10:41 AM'
 __git__ = 'https://github.com/mateuszdargacz'
 */
(function ($) {
    //Checkers
    var requiredChecker = function ($field) {
        var messageError = 'This field is required';
        return (($field.attr('required') && $field.val()) || !$field.attr('required') ) ?
        {status: statusSuccess}
            :
        {
            status: statusError,
            message: messageError
        };
    };
    var genRXChecker = function (rx) {

        var regexChecker = function ($field) {
            return rx.test($field.val()) ?
            {status: statusSuccess}
                :
            {
                status: statusError,
                message: 'Value doesn\'t match with pattern: ' + rx
            };
        };
        return regexChecker;
    };
    var emailChecker = function ($field) {
        var messageError = 'This is not valid email address!';
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return re.test($field.val()) ?
        {status: statusSuccess}
            :
        {
            status: statusError,
            message: messageError
        };
    };
    var zipCodeChecker = function ($field) {
        var messageError = 'Couldn\'t find that zipcode :(';
        return $.get('http://127.0.0.1:8000/api/get_address/' + $field.val())
            .done(function (response) {
                var data;
                if (response.success) {
                    data = {
                        status: statusSuccess,
                        message: response.city + '... isn\'t it?'
                    };
                } else
                    data = {
                        status: statusError,
                        message: messageError
                    };
                makeValidation($field, data);
            })
            .fail(
                function (response) {
                    alert("Something wrong's going on... Probably don't deserve better grade");
                }
            );
    };

    var lengthChecker = function ($field) {
        var passLength = $field.val().length,
            messageError = 'Please add ' + (options.minPasswordLength - passLength) + ' more characters';
        return passLength > minLength ?
        {status: statusSuccess}
            :
        {
            status: statusError,
            message: messageError
        };
    };
    // Enthropy checker
    var checkLower = function (elem, _, __) {
        return elem.match(/[a-z]/) ? true : false;
    };
    var checkUpper = function (elem, _, __) {
        return elem.match(/[A-Z]/) ? true : false;
    };
    var checkNumber = function (elem, _, __) {
        return elem.match(/[1-9]/) ? true : false;
    };
    var checkSpecial = function (elem, _, __) {
        return "~`!#$%^&*+@().=-[]\\\';,/{}|\":<>? ".indexOf(elem) > -1;
    };

    var lastEnthropy;
    var enthropyChecker = function ($field) {
        var lower = 0,
            upper = 0,
            special = 0,
            number = 0,
            chars = $field.val().split(''),
            enthropyEdge = 45,
            messageOK = 'Your password is quite strong!',
            messageWeak = 'Your password is too weak :(',
            messageBetter = 'You\'re getting better, but it\'s still too weak, try using some special characters and numbers',
            messageAlmost = 'You\'re almost there!',
            amount,
            enthropyPerChar,
            passEnthropy;

        if (chars.some(checkLower)) {
            lower = 26;
        }
        if (chars.some(checkUpper)) {
            upper = 26;
        }
        if (chars.some(checkSpecial)) {
            special = 32;
        }
        if (chars.some(checkNumber)) {
            number = 10;
        }
        amount = lower + upper + special + number;
        console.log('Amount:', amount);
        enthropyPerChar = Math.log(amount, 2);
        passEnthropy = enthropyPerChar * chars.length;
        console.log('passEnthropy', passEnthropy);
        if (lastEnthropy) {
            if (lastEnthropy < passEnthropy) messageWeak = messageBetter;
            if (passEnthropy > enthropyEdge - 10) messageWeak = messageAlmost;
        }
        lastEnthropy = passEnthropy;
        return enthropyEdge < passEnthropy ?
        {
            status: statusSuccess,
            message: messageOK
        }
            :
        {
            status: statusError,
            message: messageWeak
        };
    };

    //main
    var statusSuccess = 'success',
        statusError = 'error',
        basicCheckers = [requiredChecker],
        typeCheckers = {
            'password': [lengthChecker, enthropyChecker],
            'email': [emailChecker],
            'date': []
        },
        customCheckers = {};

    var checkFieldValue = function ($field) {
        var validationErrors = [],
            validationInfo = [],
            baseInfoMessage = 'Seems to be ok!';

        //Handle basic validation
        $.each(basicCheckers, function (_, checker) {
            var result = checker($field);
            if (result.status == statusError) {
                validationErrors.push(result.message);
                return false;
            } else if (result.status == statusSuccess) {
                validationInfo.push(result.message || baseInfoMessage);
            }
        });
        if (validationErrors.length > 0) return {
            status: validationErrors.length < 1 ? statusSuccess : statusError,
            message: validationErrors.length > 0 ? validationErrors[0] : validationInfo[0]
        };
        // Handle type based validation
        if (typeCheckers.hasOwnProperty($field.attr('type'))) {
            $.each(typeCheckers[$field.attr('type')], function (_, checker) {
                var result = checker($field);
                if (result.status == statusError) {
                    validationErrors.push(result.message);
                    return false;
                } else if (result.status == statusSuccess) {
                    validationInfo.push(result.message || baseInfoMessage)
                }
            });
        }
        if (validationErrors.length > 0) return {
            status: validationErrors.length < 1 ? statusSuccess : statusError,
            message: validationErrors.length > 0 ? validationErrors[0] : validationInfo[0]
        };
        // Handle custom checkers
        if (customCheckers.hasOwnProperty($field.attr('name'))) {
            $.each(customCheckers[$field.attr('name')], function (_, checker) {
                var result = checker($field);
                if (result.status == statusError) {
                    validationErrors.push(result.message);
                    return false
                } else if (result.status == statusSuccess) {
                    validationInfo.push(result.message || baseInfoMessage)
                }
            });
        }
        return {
            status: validationErrors.length < 1 ? statusSuccess : statusError,
            message: validationErrors.length > 0 ? validationErrors[0] : validationInfo[0]
        };

    };
    // hacking ajax
    var makeValidation = function ($field, data) {
        var $fieldParent = $field.parentsUntil('.form-group').parent();
        if (data) {
            $fieldParent.addClass('has-' + data.status);
            $fieldParent.find('.help-block').text(data.message);
            $field.attr('isValid', data.status == statusSuccess ? statusSuccess : statusError)
        }

        return $field
    };
    var validateField = function ($field) {
        var data = checkFieldValue($field);
        return makeValidation($field, data)
    };
    var removeValidationState = function ($field) {
        var $fieldParent = $field.parentsUntil('.form-group').parent();
        $fieldParent.removeClass('has-' + statusSuccess);
        $fieldParent.removeClass('has-' + statusError);
        $fieldParent.find('.help-block').text('');
    };

    var addFieldsActions = function (form) {
        var $fields = form.find('input, textarea');
        $fields.
        each(function () {
            $(this).isValid = false;
        }).
        on('blur', function () {
            var validAmount = 0;
            validateField($(this));
            $fields.each(function () {
                if ($(this).attr('isValid') !== null && $(this).attr('isValid') == statusError) return false;
                validAmount++;
            });
            form.attr('isValid', validAmount == $fields.length ? statusSuccess : statusError);
            form.find('[type=submit]').prop('disabled', form.attr('isValid') == statusError);

        }).
        on('focus', function () {
            removeValidationState($(this));
        });


    };
    var isValid = function () {
        return this.isValid
    };
    var initialize = function (options) {
        var that = this;
        this.forms = this.forms || [];
        this.isValid = false;
        this.filter("form").each(function () {
            var form = $(this);
            addFieldsActions(form);
            that.forms.push(form);
            form.find('[type=submit]').prop('disabled', true);
        });
        this.initialized = true
    };
    var addRXValidation = function (name, rx) {
        if (customCheckers.hasOwnProperty(name))
            customCheckers[name].push(genRXChecker(rx));
        else
            customCheckers[name] = [genRXChecker(rx)];
    };
    var addZipCodeValidation = function (name) {
        if (customCheckers.hasOwnProperty(name))
            customCheckers[name].push(zipCodeChecker);
        else
            customCheckers[name] = [zipCodeChecker];
    };
    var methods = {
        init: initialize,
        validateField: validateField,
        isValid: isValid,
        addRXValidation: addRXValidation,
        addZipCodeValidation: addZipCodeValidation

    };
    var options = {
        minPasswordLength: 8
    };
    $.fn.bsVal = function (optionsOrMethods) {
        var that = this;

        if (methods[optionsOrMethods]) {
            methods[optionsOrMethods].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (options[optionsOrMethods]) {
            if (arguments.length == 1)  return options[optionsOrMethods];
            options[optionsOrMethods] = arguments[1]
        } else if (typeof optionsOrMethods === 'object' || !optionsOrMethods) {

            methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + optionsOrMethods + ' does not exist on jQuery.bootstrapValidation plugin');
        }
        return that;

    };

}(jQuery));
