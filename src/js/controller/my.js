/*
 * Created by g on 2017/8/3.
 */
/**
 * Created by g on 2017/7/26.
 */
const modules = require('module/modules.js');
const mf = require('core/common.js');
module.exports = modules.mainMoudle.controller('my',
    ["$scope",
        function ($scope) {
            $scope.testStr1 = `
                测试
                再测试 wokao
            `;


            mf.log('my测试成功');
        }
    ]
);