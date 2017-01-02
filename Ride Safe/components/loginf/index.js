'use strict';

app.loginf = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});
app.localization.registerView('loginf');

// START_CUSTOM_CODE_loginf
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_loginf
(function(parent) {
    var provider = app.data.backendServices,
        mode = 'signin',
        registerRedirect = 'homeView',
        signinRedirect = 'homeView',
        init = function(error, result) {
            $('.status').text('');

            if (error) {
                if (error.message) {
                    $('.status').text(error.message);
                }

                return false;
            }

            var activeView = mode === 'signin' ? '.signin-view' : '.signup-view',
                model = parent.loginfModel;

            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.signin-view', 'signup-view').hide();
                $('.offline').show();
            } else {
                $('.offline').hide();

                if (mode === 'signin') {
                    $('.signup-view').hide();
                } else {
                    $('.signin-view').hide();
                }

                $(activeView).show();
            }

            if (model && model.set) {
                model.set('logout', null);
            }

        },
        successHandler = function(data) {
            var redirect = mode === 'signin' ? signinRedirect : registerRedirect,
                model = parent.loginfModel || {},
                logout = model.logout;

            if (logout) {
                model.set('logout', null);
            }
            if (data && data.result) {
                if (logout) {
                    provider.Users.logout(init, init);
                    return;
                }
                app.user = data.result;

                setTimeout(function() {
                    app.mobileApp.navigate('components/' + redirect + '/view.html');
                }, 0);
            } else {
                init();
            }
        },
        loginfModel = kendo.observable({
            displayName: '',
            email: '',
            password: '',
            errorMessage: '',
            validateData: function(data) {
                var model = loginfModel;

                if (!data.email && !data.password) {
                    model.set('errorMessage', 'Missing credentials.');
                    return false;
                }

                if (!data.email) {
                    model.set('errorMessage', 'Missing username or email.');
                    return false;
                }

                if (!data.password) {
                    model.set('errorMessage', 'Missing password.');
                    return false;
                }

                return true;
            },
            signin: function() {
                var model = loginfModel,
                    email = model.email.toLowerCase(),
                    password = model.password;

                if (!model.validateData(model)) {
                    return false;
                }

                provider.Users.login(email, password, successHandler, init);

            },
            register: function() {
                var model = loginfModel,
                    email = model.email.toLowerCase(),
                    password = model.password,
                    displayName = model.displayName,
                    attrs = {
                        Email: email,
                        DisplayName: displayName
                    };

                if (!model.validateData(model)) {
                    return false;
                }

                provider.Users.register(email, password, attrs, successHandler, init);

            },
            toggleView: function() {
                var model = loginfModel;
                model.set('errorMessage', '');

                mode = mode === 'signin' ? 'register' : 'signin';

                init();
            }
        });

    parent.set('loginfModel', loginfModel);
    parent.set('afterShow', function(e) {
        if (e && e.view && e.view.params && e.view.params.logout) {
            loginfModel.set('logout', true);
        }
        provider.Users.currentUser().then(successHandler, init);
    });
})(app.loginf);

// START_CUSTOM_CODE_loginfModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_loginfModel