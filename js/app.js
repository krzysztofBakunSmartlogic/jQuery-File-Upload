/*
 * jQuery File Upload Plugin Angular JS Example 1.2.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global window, angular */

(function () {
  var app = angular.module('uploadModule', [
    'blueimp.fileupload'
  ]);

  app.directive('ngUploadForm', ['$rootScope', 'fileUpload', function($rootScope, fileUpload) {
      return {
        restrict: 'E',
        templateUrl: './templates/fileform.html',
        scope: {
          allowed: "@",
          url: "@",
          autoUpload: "@",
          sizeLimit: "@",
          ngModel: "=",
          name: "@"
        },
        controller: function($rootScope, $scope, $element, fileUpload) {
          $scope.$on('fileuploaddone', function(e, data) {
            //data._response.files[0].fieldname = 'testfield';
            fileUpload.addFieldData($scope.name, data._response.result.files[0].result);
          });

          $scope.options = {
            url: $scope.url,
            dropZone: $element,
            maxFileSize: $scope.sizeLimit,
            autoUpload: $scope.autoUpload
          };
          $scope.loadingFiles = false;

          if(!$scope.queue) $scope.queue = [];

          var generateFileObject = function generateFileObjects(objects) {
            console.log('test');
            angular.forEach(objects, function(value, key) {
              var fileObject = {
                name: value.filename,
                size: value.length,
                url: '/file/'+value._id,
                thumbnailUrl: '/file/'+value._id,
                deleteUrl: '/file/'+value._id,
                deleteType: 'DELETE',
                result: value
              }
              $scope.queue[key] = fileObject;
            });
          }
          fileUpload.registerField($scope.name);
          $scope.filequeue = fileUpload.fieldData[$scope.name];

          $scope.$watchCollection('filequeue', function(newval, oldval) {
            generateFileObject(newval);
          });
        }
      }
    }])
    .controller('FileDestroyController', ['$rootScope','$scope', '$http', 'fileUpload', function ($rootScope, $scope, $http, fileUpload) {
      var file = $scope.file,
        state;

      if($scope.$parent && $scope.$parent.$parent && $scope.$parent.$parent.$parent.name) {
        $scope.fieldname = $scope.$parent.$parent.$parent.name;
      }

      if(!fileUpload.fieldData[$scope.name]) {
        fileUpload.fieldData[$scope.name] = [];
      }

      $scope.filequeue = fileUpload.fieldData;

      if (file.url) {
        file.$state = function () {
          return state;
        };
        file.$destroy = function () {
          state = 'pending';
          return $http({
            url: file.deleteUrl,
            method: file.deleteType
          }).then(
            function (data) {
              state = 'resolved';
              fileUpload.removeFieldData($scope.fieldname, file.result._id);
              $scope.clear(file);
            },
            function (data) {
              state = 'rejected';
              fileUpload.removeFieldData($scope.fieldname, file.result._id);
              $scope.clear(file);
            }
          );


        };
      } else if (!file.$cancel && !file._index) {
        file.$cancel = function () {
          $scope.clear(file);
        };
      }
    }
    ]);;
})();