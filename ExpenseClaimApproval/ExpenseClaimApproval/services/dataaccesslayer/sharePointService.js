
/* 

     This module consume  DataModel in order to following context 
     Consumer should provide relevant data in order to perform relavant request types
        options {
             listName   : "list name" ,
             requestType   : "getList/ getItem / createItem / updateItem / deleteItem",
             query  : "provide camel query" ,
             itemId : "your target item id" ,
             data   : "Data to post or update" ,
             rowLimit : "row limits for list query",
             fieldName : "field name to retrive item" ,
             fieldValue :"field value to retirive item"
             columns : "Title , Id , Name"  // field types want to retrive
             id : "Id Of the Item"
           }
*/


(function () {

    'use strict';

    angular
        .module('ExpenseClaimApproval')
        .factory('sharePointService', sharePointService);

    sharePointService.$inject = ['$http', '$q', 'helperService'];

    function sharePointService($http, $q, helperService) {


        var service = {
            get: getList,
            post: createItem,
            getItem: getItem,
            put: updateItem,
            remove: deleteItem,
            getItemByQuery: getItemByQuery,
            createDocument: createDocument,
            viewDocuments: viewDocuments,
            deleteDocument: deleteDocument,
            getUsers: getUsers,
            createItemWithFolder: createItemWithFolder,
            getWebAppUrl: getWebAppUrl,
            createFolder: createFolder,
            deleteFolder: deleteFolder,
            createSPGroup: createSPGroup,
            getSPGroups: getSPGroups,
            setSPUsers:setSPUsers
        };

        return service;


        //function for getting all list items
        function getList(options) {

            var deferred = $q.defer();

            // validating options
            var defObject = {
                listName: false,
                query: false,
                rowLimit: 10,
                columns: false,
                fields: false,
                useCustomCaml: false,
                columns: false,
                condition: false

            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.fields)) {
                deferred.reject();
                return deferred.promise;
            }



            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(settings.listName);

            //var camlQuery = new SP.CamlQuery();

            /* check whether rowLimit is avalible or query details avalable
               retrive first 20 rows if both of parameters not avalable 
            */

            //camlQuery = getCamlView(options.columns, options.condition, 20);

            var camlQuery = new SP.CamlQuery();
            if (settings.useCustomCaml) {
                camlQuery.set_viewXml(settings.customCamlXml);
            } else {

                if (settings.position !== undefined)
                    camlQuery.set_listItemCollectionPosition(position);
                if (settings.folder !== undefined)
                    camlQuery.set_folderServerRelativeUrl(_spPageContextInfo.webServerRelativeUrl + "/Lists/" + settings.listName + "/" + settings.folder);

                camlQuery.set_viewXml(getCamlView(settings.columns, settings.condition, 20));

            }


            var collListItem = oList.getItems(camlQuery);

            // including options if avalable
            //if (settings.columns) {
            //    context.load(collListItem, 'Include(' + options.columns.join() + ')');
            //} else {
            context.load(collListItem);
            //}

            context.executeQueryAsync(getAllItems, fail);

            //return current Item Collection json
            function getAllItems() {
                // load query details to json object
                var tasksEntries = [];
                var itemsCount = collListItem.get_count();
                for (var i = 0; i < itemsCount; i++) {
                    var item = collListItem.itemAt(i);
                    var taskEntry = item.get_fieldValues();
                    tasksEntries.push(helperService.parse(taskEntry, options.fields.mappingFromSP));
                }
                deferred.resolve(tasksEntries);

            }

            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }

            return deferred.promise;


        }

        //Method for creating single item 
        function createItem(options) {


            var deferred = $q.defer();

            var defObject = {
                listName: false,
                data: false,
                fields: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.data) && (!settings.fields)) {
                deferred.reject();
                return deferred.promise;
            }


            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(settings.listName);

            var itemCreateInfo = new SP.ListItemCreationInformation();
            var oListItem = oList.addItem(itemCreateInfo);

            settings.data = helperService.parse(settings.data, settings.fields.mappingToSP);


            //Bulk create list items
            $.each(settings.data, function (key, value) {
                // check if mutiple lookup
                if (Object.prototype.toString.call(value) === '[object Array]') {
                    var lookups = [];
                    $.each(value, function (i, lid) {
                        var lookup = new SP.FieldLookupValue();
                        lookup.set_lookupId(lid);
                        lookups.push(lookup);
                    });
                    oListItem.set_item(key, lookups);
                } else {
                    oListItem.set_item(key, value);
                }
            });


            oListItem.update();


            context.load(oListItem);
            context.executeQueryAsync(success, fail);

            function success() {
                // load query details to json object
                var taskEntry = oListItem.get_fieldValues();
                deferred.resolve(helperService.parse(taskEntry, settings.fields.mappingFromSP));
            }

            function fail(sender, args) {
                deferred.reject(args);
            }

            return deferred.promise;

        }

        // method to get single item (By ID)
        function getItem(options) {

            var deferred = $q.defer();

            var defObject = {
                listName: false,
                id: false,
                columns: false,
                fields: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.id) && (!settings.fields)) {
                deferred.reject();
                return deferred.promise;
            }

            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(settings.listName);


            // query field by field name and value 
            var oListItem = oList.getItemById(settings.id);

            context.load(oListItem);


            context.executeQueryAsync(success, fail);
            // load query details to json object
            function success() {
                if (oListItem !== undefined) {
                    var taskEntry = oListItem.get_fieldValues();
                    deferred.resolve(helperService.parse(taskEntry, options.fields.mappingFromSP));
                } else {
                    fail("No Such Element");
                }
            }

            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }

            return deferred.promise;

        }

        // delete single item (By ID)
        function deleteItem(options) {

            var deferred = $q.defer();

            var defObject = {
                listName: false,
                fields: false,
                id: false,
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.id) && (!settings.fields)) {
                deferred.reject();
                return deferred.promise;
            }

            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(settings.listName);


            // query field by field name and value 
            var oListItem = oList.getItemById(settings.id);
            oListItem.deleteObject();



            context.executeQueryAsync(success, fail);

            function success() {
                // load query details to json object
                var taskEntry = oListItem.get_fieldValues();
                deferred.resolve(helperService.parse(taskEntry, options.fields.mappingFromSP));
            }


            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }


            return deferred.promise;



        }

        // Update Single Item (By ID)
        function updateItem(options) {

            var deferred = $q.defer();

            var defObject = {
                listName: false,
                data: false,
                id: false,
                fields: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.data) && (!settings.id) && (!settings.fields)) {
                deferred.reject(settings);
                return deferred.promise;
            }

            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(settings.listName);

            // query field by field name and value 
            var oListItem = oList.getItemById(settings.id);


            settings.data = helperService.parse(settings.data, settings.fields.mappingToSP);
            delete settings.data.ID;

            //Bulk create list items
            $.each(settings.data, function (key, value) {
                // check if mutiple lookup
                if (Object.prototype.toString.call(value) === '[object Array]') {
                    var lookups = [];
                    $.each(value, function (i, lid) {
                        var lookup = new SP.FieldLookupValue();
                        lookup.set_lookupId(lid);
                        lookups.push(lookup);
                    });
                    oListItem.set_item(key, lookups);
                } else {
                    oListItem.set_item(key, value);
                }
            });

            oListItem.update();

            context.executeQueryAsync(success, fail);


            function success() {
                // load query details to json object
                var taskEntry = oListItem.get_fieldValues();
                deferred.resolve(helperService.parse(taskEntry, options.fields.mappingFromSP));
            }


            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }


            return deferred.promise;


        }

        /*
         * Manipulate Sharepoint List By Query 
         * 
         */


        // method to get single item 
        function getItemByQuery(options) {

            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(options.listName);
            var deferred = $q.defer();

            var defObject = {
                listName: false,
                fieldValue: false,
                columns: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.columns)) {
                deferred.reject();
                return deferred.promise;
            }


            var camlQuery = new SP.CamlQuery();

            // query field by field name and value 
            camlQuery.set_viewXml("<View><Query><Where><Eq><FieldRef Name='" + options.fieldName + "' /><Value Type='Text'>" + options.fieldValue + "</Value></Eq></Where></Query><ViewFields /><QueryOptions /></View>");

            var collListItems = oList.getItems(camlQuery);

            context.load(collListItems, 'Include(' + options.columns.join() + ')');


            context.executeQueryAsync(success, fail);
            // load query details to json object
            function success() {
                // load query details to json object 
                var oListItem = collListItems.itemAt(0);
                context.load(oListItem);
                context.executeQueryAsync(done, fail)

                function done() {
                    if (oListItem !== undefined) {
                        var taskEntry = oListItem.get_fieldValues();
                        deferred.resolve(taskEntry);
                    } else {
                        fail("No Such Element");
                    }
                }


            }

            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }

            return deferred.promise;





        }

        // Update Single Item
        function updateItemByQuery(options) {

            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(options.listName);
            var deferred = $q.defer();

            var defObject = {
                listName: false,
                data: false,
                fieldName: false,
                fieldValue: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.data) && (!settings.fieldName) && (!settings.fieldValue)) {
                deferred.reject(settings);
                return deferred.promise;
            }

            var camlQuery = new SP.CamlQuery();


            // query and filter item by field name and value 
            camlQuery.set_viewXml("<View><Query><Where><Eq><FieldRef Name='" + options.fieldName + "' /><Value Type='Text'>" + options.fieldValue + "</Value></Eq></Where></Query><ViewFields /><QueryOptions /></View>");


            var collListItems = oList.getItems(camlQuery);
            context.load(collListItems);
            context.executeQueryAsync(done, fail);
            var oListItem = null;

            function done() {

                oListItem = collListItems.itemAt(0);

                //Bulk create list items
                $.each(options.data, function (key, value) {
                    oListItem.set_item(key, value);
                    oListItem.update();
                });




                context.load(oListItem);
                context.executeQueryAsync(success, fail);


                function success() {
                    // load query details to json object
                    var taskEntry = oListItem.get_fieldValues();
                    deferred.resolve(taskEntry);
                }


            }




            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }


            return deferred.promise;


        }

        // Delete single item
        function deleteItemByQuery(options) {

            var context = SP.ClientContext.get_current();


            var oList = context.get_web().get_lists().getByTitle(options.listName);
            var deferred = $q.defer();
            var camlQuery = new SP.CamlQuery();

            // query single item from a list
            camlQuery.set_viewXml("<View><Query><Where><Eq><FieldRef Name='" + options.fieldName + "' /><Value Type='Text'>" + options.fieldValue + "</Value></Eq></Where></Query><ViewFields /><QueryOptions /></View>");
            var collListItems = oList.getItems(camlQuery);
            context.load(collListItems);
            context.executeQueryAsync(done, fail);
            var oListItem = null;

            function done() {

                oListItem = collListItems.itemAt(0);

                oListItem.deleteObject();

                context.executeQueryAsync(success, fail);

                function success() {
                    // load query details to json object
                    var taskEntry = oListItem.get_fieldValues();
                    deferred.resolve(taskEntry);
                }


            }


            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }


            return deferred.promise;



        }

        function createFolder(options) {
            //listName, folderName, parentFolder

            var defObject = {
                listName: undefined,
                folderName: undefined,
                parentFolder: undefined
            };

            var settings = $.extend({}, defObject, options);

            var deferred = $q.defer();


            var clientContext = SP.ClientContext.get_current();
            var oWeb = clientContext.get_web();
            var oList = oWeb.get_lists().getByTitle(settings.listName);

            var itemCreateInfo = new SP.ListItemCreationInformation();
            itemCreateInfo.set_underlyingObjectType(SP.FileSystemObjectType.folder);
            itemCreateInfo.set_leafName(settings.folderName);

            if (settings.parentFolder !== undefined && settings.parentFolder !== null && settings.parentFolder.indexOf("/") != 0) settings.parentFolder = "/" + settings.parentFolder;
            if (settings.parentFolder) {
                var url = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + settings.listName + settings.parentFolder;
                itemCreateInfo.set_folderUrl(url);
            }

            var oListItem = oList.addItem(itemCreateInfo);
            oListItem.set_item('Title', settings.folderName);
            oListItem.update();

            clientContext.load(oListItem);
            clientContext.executeQueryAsync(function () {
                deferred.resolve(oListItem);
            }, function (sender, args) {
                deferred.reject(msg);
            });

            return deferred.promise;
        };
        // Documents
        function createDocument(options) {

            var deferred = $q.defer();

            var defObject = {
                listName: false,
                file: false,
                fieldData: false,
                folderName: undefined
            };

            var settings = $.extend({}, defObject, options);


            if ((!settings.listName) && (!settings.file) && (!settings.fieldData)) {
                deferred.reject();
                return deferred.promise;
            }


            var context = SP.ClientContext.get_current();

            //var file = options.file ;
            // getting the list 
            var oList = context.get_web().get_lists().getByTitle(settings.listName);


            var fileCreateInfo = new SP.FileCreationInformation();
            fileCreateInfo.set_url(settings.data.fileName);
            fileCreateInfo.set_overwrite(true);
            fileCreateInfo.set_content(new SP.Base64EncodedByteArray());

            // Read the binary contents of the base 64 data URL into a Uint8Array
            // Append the contents of this array to the SP.FileCreationInformation
            var arr = convertDataURIToBinary(settings.data.fileData);
            for (var i = 0; i < arr.length; ++i) {
                fileCreateInfo.get_content().append(arr[i]);
            }
            var folder;
            var fname = settings.data.folderName;
            if (fname !== undefined && fname != null) {
                var wsrUrl = _spPageContextInfo.webServerRelativeUrl;
                if (fname.indexOf("/") != 0) fname = "/" + fname;

                folder = context.get_web().getFolderByServerRelativeUrl(wsrUrl + "/Lists/" + settings.listName + fname);
            } else {
                folder = context.get_web().get_lists().getByTitle(settings.listName).get_rootFolder();
            }

            // Upload the file to the root folder of the document library
            var newFile = folder.get_files().add(fileCreateInfo);

            context.load(newFile);
            context.executeQueryAsync(onSuccess, onFailure);

            function onSuccess() {
                var file = newFile;
                delete settings.data.fileData;
                //createItem(options).then(deferred.resolve, deferred.reject);

                var oListItem = file.get_listItemAllFields()

                settings.data = helperService.parse(settings.data, settings.fields.mappingToSP);
                //Bulk create list items
                $.each(settings.data, function (key, value) {
                    // check if mutiple lookup
                    if (Object.prototype.toString.call(value) === '[object Array]') {
                        var lookups = [];
                        $.each(value, function (i, lid) {
                            var lookup = new SP.FieldLookupValue();
                            lookup.set_lookupId(lid);
                            lookups.push(lookup);
                        });
                        oListItem.set_item(key, lookups);
                    } else {
                        oListItem.set_item(key, value);
                    }
                });

                oListItem.update();

                context.executeQueryAsync(function () {

                    var taskEntry = oListItem.get_fieldValues();
                    deferred.resolve(helperService.parse(taskEntry, options.fields.mappingFromSP));
                }, function (sender, args) {
                    deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
                });

            }

            function onFailure(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
                //return deferred.promise;

            }

            return deferred.promise;



        }

        function viewDocuments(options) {

            var deferred = $q.defer();

            // validating options
            var defObject = {
                listName: false,
                query: false,
                rowLimit: 10,
                columns: false,
                fields: false,
                useCustomCaml: false,
                columns: false,
                condition: false

            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.fields)) {
                deferred.reject();
                return deferred.promise;
            }

            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(settings.listName);

            //var camlQuery = new SP.CamlQuery();

            /* check whether rowLimit is avalible or query details avalable
               retrive first 20 rows if both of parameters not avalable 
            */

            //camlQuery = getCamlView(options.columns, options.condition, 20);

            var camlQuery = new SP.CamlQuery();
            if (settings.useCustomCaml) {
                camlQuery.set_viewXml(settings.customCamlXml);
            } else {

                if (settings.position !== undefined)
                    camlQuery.set_listItemCollectionPosition(position);
                if (settings.folder !== undefined)
                    camlQuery.set_folderServerRelativeUrl(_spPageContextInfo.webServerRelativeUrl + "/Lists/" + settings.listName + "/" + settings.folder);

                camlQuery.set_viewXml(getCamlView(settings.columns, settings.condition, 20));

            }


            var collListItem = oList.getItems(camlQuery);

            // including options if avalable
            //if (settings.columns) {
            //    context.load(collListItem, 'Include(' + options.columns.join() + ')');
            //} else {
            context.load(collListItem);
            //}

            context.executeQueryAsync(getAllItems, fail);

            //return current Item Collection json
            function getAllItems() {
                // load query details to json object
                var oWebsite = context.get_web();
                context.load(oWebsite);
                var tasksEntries = [];

                context.executeQueryAsync(function () {

                    var itemsCount = collListItem.get_count();
                    for (var i = 0; i < itemsCount; i++) {
                        var item = collListItem.itemAt(i);
                        var taskEntry = item.get_fieldValues();

                        taskEntry.SourceURL = context.get_web().get_serverRelativeUrl() + "/Lists/" + options.listName + "/" + taskEntry.DocumentName;
                        tasksEntries.push(helperService.parse(taskEntry, options.fields.mappingFromSP));

                    }

                    deferred.resolve(tasksEntries);


                });



            }

            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }

            return deferred.promise;



        }

        function deleteDocument(options) {

            var deferred = $q.defer();

            var defObject = {
                listName: false,
                fields: false,
                id: false,
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.id) && (!settings.fields)) {
                deferred.reject();
                return deferred.promise;
            }

            var context = SP.ClientContext.get_current();

            var oList = context.get_web().get_lists().getByTitle(settings.listName);

            // query field by field name and value 
            var oListItem = oList.getItemById(settings.id);
            oListItem.deleteObject();



            context.executeQueryAsync(success, fail);

            function success() {
                // load query details to json object
                var taskEntry = oListItem.get_fieldValues();
                deferred.resolve(helperService.parse(taskEntry, options.fields.mappingFromSP));

            }


            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }


            return deferred.promise;
        }

        function deleteFolder(options) {
            var clientContext;
            var oWebsite;
            var folderUrl;

            var deferred = $q.defer();

            var defObject = {
                listName: false,
                id: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.id) && (!settings.listName)) {
                deferred.reject();
                return deferred.promise;
            }

            clientContext = new SP.ClientContext.get_current();
            oWebsite = clientContext.get_web();

            clientContext.load(oWebsite);
            clientContext.executeQueryAsync(function () {
                folderUrl = oWebsite.get_serverRelativeUrl() + "/Lists/" + settings.listName + "/" + settings.id;
                this.folderToDelete = oWebsite.getFolderByServerRelativeUrl(folderUrl);
                this.folderToDelete.deleteObject();

                clientContext.executeQueryAsync(
                    Function.createDelegate(this, successHandler),
                    Function.createDelegate(this, errorHandler)
                );
            }, errorHandler);

            return deferred.promise;

            function successHandler() {
                deferred.resolve("Folder Deleted Successfully!");
            }

            function errorHandler() {
                deferred.reject("Folder Delete failed");
            }
        }

        function createSPGroup(options) {
            var deferred = $q.defer();

            var defObject = {
                title: false,
                description: false,
                role: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.title) && (!settings.description) && (!settings.role)) {
                deferred.reject();
                return deferred.promise;
            }

            var context = SP.ClientContext.get_current();
            var web = context.get_web();

            var groupCollection = web.get_siteGroups();

            var membersGRP = new SP.GroupCreationInformation();
            membersGRP.set_title(settings.title);
            membersGRP.set_description(settings.description);

            var currentUser = web.get_currentUser();
            context.load(currentUser);
            context.load(web, 'Title', 'HasUniqueRoleAssignments');

            context.executeQueryAsync(function () {


                if (!web.get_hasUniqueRoleAssignments()) {
                    web.breakRoleInheritance(true, false);
                }

                //add group to site gorup collection  
                var newCreateGroup = groupCollection.add(membersGRP);
                //Role Definition   
                var rolDef = web.get_roleDefinitions().getByName(settings.role);
                var rolDefColl = SP.RoleDefinitionBindingCollection.newObject(context);
                rolDefColl.add(rolDef);

                // Get the RoleAssignmentCollection for the target web.  
                var roleAssignments = web.get_roleAssignments();
                // assign the group to the new RoleDefinitionBindingCollection.  
                roleAssignments.add(newCreateGroup, rolDefColl);
                //Set group properties  
                newCreateGroup.set_allowMembersEditMembership(false);
                newCreateGroup.set_onlyAllowMembersViewMembership(false);
                //add currect user to group  
                if (settings.role == "Edit") {
                    newCreateGroup.get_users().addUser(currentUser);
                }

                newCreateGroup.update();
                context.load(newCreateGroup);
                context.executeQueryAsync(
                    function () {
                        deferred.resolve();
                        alert("Group Created Successfully");
                    },
                    function (sender, args) {
                        deferred.reject();
                        alert("Failed to create groups " + args.get_message());
                    });
            });



            //var oMembersGRP = web.get_siteGroups().add(membersGRP);

            //var rdContribute = web.get_roleDefinitions().getByName(settings.role);

           //var collContribute = SP.RoleDefinitionBindingCollection.newObject(context);

           // collContribute.add(rdContribute);
           // var assignments = web.get_roleAssignments();

           // var roleAssignmentContribute = assignments.add(oMembersGRP, collContribute);

    

            return deferred.promise;
        }

        function getSPGroups(options) {
            var deferred = $q.defer();

            var context = SP.ClientContext.get_current();
            var siteGroups = context.get_web().get_siteGroups();
            context.load(siteGroups);
            context.executeQueryAsync(success, fail);


            //return current Item Collection json
            function success() {
                // load query details to json object
                var tasksEntries = [];
                var itemsCount = siteGroups.get_count();
                for (var i = 0; i < itemsCount; i++) {
                    var user = siteGroups.itemAt(i);
                    var taskEntry = {
                        title: user.get_title(),
                        id: user.get_id(),
                        description: user.get_description()
                    }
                    tasksEntries.push(taskEntry);
                }
                deferred.resolve(tasksEntries);

            }

            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }
            return deferred.promise;
        }

        function setSPUsers(options) {
            var deferred = $q.defer();

            var defObject = {
                group: false,
                users: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.group) && (!settings.users)) {
                deferred.reject();
                return deferred.promise;
            }

            var context = SP.ClientContext.get_current();
            var siteGroups = context.get_web().get_siteGroups();
            var group = siteGroups.getByName(settings.group);
            var user = context.get_web().get_currentUser();
            var userCollection = group.get_users();
            userCollection.addUser(user);
            context.load(user);
            context.load(group);
            context.executeQueryAsync(
       function () {
           deferred.resolve();
           alert("User is added successfully to the group");
       },
       function (sender, args) {
           deferred.reject();
           alert("Failed add user to the group " + args.get_message());
       });
            return deferred.promise;
        }

        function convertDataURIToBinary(dataURI) {
            var BASE64_MARKER = ';base64,';
            var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
            var base64 = dataURI.substring(base64Index);
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }
            return array;
        }

        // End Of Documents


        // Folders CRUD Operatoins 


        function createItemWithFolder(options) {
            var context = SP.ClientContext.get_current();


            var oList = context.get_web().get_lists().getByTitle(options.listName);
            var deferred = $q.defer();

            var defObject = {
                listName: false,
                data: false,
                fields: false
            };

            var settings = $.extend({}, defObject, options);

            if ((!settings.listName) && (!settings.data) && (!settings.fields)) {
                deferred.reject();
                return deferred.promise;
            }



            var itemCreateInfo = new SP.ListItemCreationInformation();


            var oListItem = oList.addItem(itemCreateInfo);

            options.data = helperService.parse(options.data, options.fields.mappingToSP);


            //Bulk create list items
            $.each(options.data, function (key, value) {
                oListItem.set_item(key, value);
            });


            oListItem.update();


            context.load(oListItem);
            context.executeQueryAsync(success, fail);

            function success() {
                // load query details to json object
                var taskEntry = oListItem.get_fieldValues();

                var itemCreateInfo = new SP.ListItemCreationInformation();
                itemCreateInfo.set_underlyingObjectType(SP.FileSystemObjectType.folder);
                itemCreateInfo.set_leafName("Folder" + taskEntry.ID);
                itemCreateInfo.set_folderUrl('/Lists/' + options.listName + '/Folder' + taskEntry.ID);
                oListItem.set_item("Title", "Folder/" + taskEntry.ID);
                var ooListItem = oList.addItem(itemCreateInfo);
                context.load(ooListItem);
                context.executeQueryAsync(function () {
                    deferred.resolve(ooListItem.get_fieldValues());

                }, function () {

                    deferred.reject(args.get_message() + '\n' + args.get_stackTrace());

                });


                deferred.resolve(helperService.parse(taskEntry, options.fields.mappingFromSP));
            }

            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }

            return deferred.promise;

        }

        //End of CRUD Operations 


        // handling sharepoint users


        function getUsers(options) {

            var deferred = $q.defer();

            var context = SP.ClientContext.get_current();
            var oList = context.get_web().get_siteUserInfoList();
            var collListItem = oList.getItems();
            context.load(collListItem);
            context.executeQueryAsync(success, fail);


            //return current Item Collection json
            function success() {
                // load query details to json object
                var tasksEntries = [];
                var itemsCount = collListItem.get_count();
                for (var i = 0; i < itemsCount; i++) {
                    var user = collListItem.itemAt(i);
                    var taskEntry = item.get_fieldValues();
                    tasksEntries.push(helperService.parse(taskEntry, options.fields.mappingFromSP));
                }
                deferred.resolve(tasksEntries);

            }

            function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            }


            return deferred.promise;


        }


        //End of sharepoint usres


        //get camel view
        function getCamlView(columnNames, condition, itemCount) {

            var camlColumnNames = "<FieldRef Name='Id'/>";

            var index = $.inArray("id", $.map(columnNames, function (n, i) { return n.toLowerCase(); }));
            if (index >= 0) columnNames.splice(index, 1);

            for (var i = 0; i < columnNames.length; i++) {
                var col = columnNames[i];
                camlColumnNames += "<FieldRef Name='" + col + "'/>";
            }

            return (
                "<View>" +
                    "<RowLimit>" + itemCount + "</RowLimit>" +
                    "<ViewFields>" + camlColumnNames + "</ViewFields>" +
                    "<Query>" +
                        (condition !== undefined ? condition : "") +
                        "<OrderBy><FieldRef Name='Created' Ascending='FALSE'/></OrderBy>" +
                    "</Query>" +
                "</View>");
        }



        function getWebAppUrl() {

            var deferred = $q.defer();

            var context = SP.ClientContext.get_current();


            var oWebsite = context.get_web();
            context.load(oWebsite);


            context.executeQueryAsync(function () {

                deferred.resolve(context.get_web().get_serverRelativeUrl());

            }, function fail(sender, args) {
                deferred.reject(args.get_message() + '\n' + args.get_stackTrace());
            });


            return deferred.promise;

        }


















    }


})();