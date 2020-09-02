"use strict"

const HTTP_OPERATION_OK            = 0;    
const HTTP_ERROR_NOT_LOGGED        = 1;
const HTTP_ERROR_LOST_PARAMETER    = 2;
const HTTP_ERROR_CONNECTION_SQL    = 3;
const HTTP_ERROR_SQL               = 4;
const HTTP_ERROR_WRONG_PASSWORD    = 5;
const HTTP_ERROR_WRONG_USER        = 6;
const HTTP_ERROR_MODEL_LOAD        = 7;
const HTTP_ERROR_PARAMETERS        = 8;

const STATE_LOGGED     = 'L';
const STATE_NOT_LOGGED = 'N';

var SIRIOApp = angular.module("SIRIOApp",["ngMaterial","ui.router","ngMessages",'md.data.table']);