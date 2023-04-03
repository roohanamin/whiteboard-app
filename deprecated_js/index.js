let canvas = new fabric.Canvas('whiteboard');
var onSolidRect = function() {
  var rect = new fabric.Rect({
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: '',
    selection: false,
    fill: '#f55'
  });
  canvas.add(rect);
};
var removeSelected = function() {
  let object = canvas.getActiveObject();
  if(object) {
    canvas.remove(object);
  };
};

let demo_users = [
  {
    'token': 'bc58e22324d221f9f3391cccbf8e2f798998accac874c6e55456a3foa125ac25f90',
    'uid': '5298188' // fabela
  },
  {
    'token': '81795ee5e0da1e4adf315467eedae24cbfbe09816b48d1b343ecc456a3ewac18dcf62e0	',
    'uid': '5298187' // amin
  },
  {
    'token': '3db3fbc014304eab31ede64a48f05e829d62a5f86f255e88456a3cia1010127b3d	',
    'uid': '5298186' // patchin
  }
];

let user_index = prompt('Select user: 0, 1, 2', 0);
let selected_user = demo_users[user_index];
console.log(user_index)

const MESIBO_APP_ID = 'iizqy4tzifhqggi9pj7ium6hdx3mw1q5lh87cjun4k1gik025a9p3n0azzr6j9cn';
const MESIBO_ACCESS_TOKEN = selected_user.token;
const MESIBO_USER_UID = selected_user.uid; 
const MESIBO_GROUP_ID = 2612883; //Create a group and add members(demo_users). Set group id. 
const TYPE_CANVAS_MESSAGE = 7;


function MesiboListener() {

};

MesiboListener.prototype.Mesibo_OnConnectionStatus = function(status, value) {
  console.log("TestNotify.prototype.Messibo_OnConnectionStatus: " + status);
};

MesiboListener.prototype.Mesibo_OnMessageStatus = function(m) {
  console.log("TestNotify.prototype.Mesibo_OnMessageStatus: from " + m.peer + " status: " + m.status);
};

var api = new Mesibo();
api.setAppName(MESIBO_APP_ID);
api.setListener(new MesiboListener());
api.setCredentials(MESIBO_ACCESS_TOKEN);
api.start();

function sendObjectToGroup(pObject) {
  var m = {};
  m.id = api.random();
  m.groupid = MESIBO_GROUP_ID;
  m.flag = MESIBO_FLAG_DEFAULT;
  m.type = TYPE_CANVAS_MESSAGE;
  m.message = JSON.stringify(pObject);
  api.sendMessage(m, m.id, m.message);
};

function getObjectFromId(ctx, id) {
  var currentObjects = ctx.getObjects();
  for (let i = currentObjects.length - 1; i >= 0; i--) {
    if(currentObjects[i].id == id) {
      return currentObjects[i];
    };
    return null;
  }
};

function Board_OnSync(_canvas, obj) {
  var existing = getObjectFromId(_canvas, obj.id);
  console.log(existing);
  if (obj.removed) {
    if (existing) {
      canvas.remove(existing);
    }
    return;
  };

  if (existing) {
    existing.set(obj);
  }
  else {
    if (obj.type === 'rect') {
      _canvas.add(new fabric.Rect(obj));
    }
  }
  _canvas.renderAll();
}

MesiboListener.prototype.Mesibo_OnMessage = function(m) {
  if (m && m.type === TYPE_CANVAS_MESSAGE && m.groupid && m.message) {
    let syncObj = JSON.parse(m.message);
    Board_OnSync(canvas, syncObj);
    return;
  }
};

canvas.on('object:added', function(options) {
  if (options.target) {
    let obj = options.target;
    if (obj.type == 'rect') {
      console.log('You added a rectangle!');
    }
    if (!obj.id) {
      obj.set('id', Date.now() + '-' + MESIBO_USER_UID);
      obj.toJSON = (function(toJSON) {
        return function() {
          return fabric.util.object.extend(toJSON.call(this), {
            id: this.id
          });
        };
      })(obj.toJSON);
      sendObjectToGroup(obj);
    }
  }
});

canvas.on('object:removed', function(options) {
  if (options.target) {
    let obj = options.target;
    if (obj.removed) {
      return;
    }
    obj.set('removed', true);
    obj.toJSON = (function(toJSON) {
      return function() {
        return fabric.util.object.extend(toJSON.call(this), {
          id: this.id,
          uid: this.uid,
          removed: this.removed
        });
      };
    })(obj.toJSON);
  }
});

// iizqy4tzifhqggi9pj7ium6hdx3mw1q5lh87cjun4k1gik025a9p3n0azzr6j9cn

// JSON Body for making user
// {
//   "op":"useradd",
//   "token": "cn9cvk6gnm15e7lrjb2k7ggggax5h90n5x7dp4sam6kwitl2hmg4cmwabet4zgdw",
//   "user": {
// 	"address":"xyz@example.com",

//   	"token": {
// 		"appid": "com.example.mesiboapp",
// 		"expiry": 525600
//   	}
//   }
// }