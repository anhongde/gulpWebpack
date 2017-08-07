/**
 * Created by g on 2017/7/26.
 */
const modules = require('module/modules.js');
const mf = require('core/common.js');
module.exports = modules.mainMoudle.controller('mainController',
    ["$scope",
        function ($scope) {
            $scope.testStr = `
                测试
                再测试 wokao
            `;


            mf.log('mainController测试成功');
        }
    ]
);