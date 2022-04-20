const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({endoede : true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

var db;
MongoClient.connect('mongodb+srv://safa940812:Gntifr5897@cluster0.aonzc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(error, client){
    //연결되면 할 일
    if(error) { return console.log(error) }

    db = client.db('todoapp');

    //db.collection('post').insertOne('저장할데이터', function(){});
    //db.collection('post').insertOne({name : 'John', age : 20, _id : 100}, function(error, result){
    //    console.log('저장완료');
    //});

    app.listen(8080, function(){
        console.log("listening on 8080");
    });

});


//app.get('경로', function(요청, 응답){});
app.get('/pet', function(req, res){
    res.send('펫용품을 쇼핑 할 수 있는 사이트입니다.');
});
app.get('/', function(req, res){
    res.render('index.ejs');
});
app.get('/write', function(req, res){
    res.render('write.ejs');
});
app.get('/list', function(req, res){
    //DB에 저장된 post라는 collection안의 데이터를 꺼내주세요.
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        res.render('list.ejs', {posts : result});
    });

});
app.get('/detail/:id', function(req, res){
    req.params.id = parseInt(req.params.id);
    db.collection('post').findOne({_id:req.params.id},function(error, result){
        if(result == null) {
            res.send('404 ERROR');
            return false;
        };
        res.render('detail.ejs',{data : result});
        console.log(result);
    });
})
app.get('/edit/:id', function(req, res){
    req.params.id = parseInt(req.params.id);
    db.collection('post').findOne({_id : req.params.id}, function(error, result){
        if(result == null){
            res.send('404 ERROR');
            return false;
        }
        res.render('edit.ejs', {data : result});
    })
});


/*
    POST요청으로 서버에 데이터 전송하고 싶으면
    1. body-parser 라이브러리 필요
    2. input에 name 작성
*/

//db.collection('post').updateOne({_id:2}, {$set : {title:'변경된 할일1'}});
app.post('/add', function(req, res){ // 누가 폼에서 /add로 POST 요청을 하면
    res.send('전송완료'); // 일단 화면에는 '전송완료' 메시지 출력
    db.collection('counter').findOne({name:'게시물갯수'}, function(error, result){ // db에서 counter라는 콜렉션을 찾아서, {name:'게시물갯수'}를 찾아서,
        console.log(result.totalPost); // 콘솔창에 출력 후
        var totalPost = result.totalPost; // totalPost라는 변수에 db에서 찾은 totalPost를 담고,

        db.collection('post').insertOne({_id:totalPost + 1, title : req.body.title, date : req.body.date  }, function(error, result){
            //db에서 post라는 콜렉션에, id는 totalPost+1, title은 POST된 title, date는 POST된 date를 넣고나서,

            console.log('저장완료'); // 콘솔창 출력

            db.collection('counter').updateOne({name:'게시물갯수'},{$inc : {totalPost:1}}, function(error, result){ // db에서 counter라는 콜렉션의 {name:'게시물갯수'}를 찾아서 수정을 하는데, 1씩 증가하게
                if(error){ return console.log(error)}
                /*
                    operator
                        $set : 변경 {$set : {totalPost : 바꿀 값}}
                        $inc : 증가 {$inc : {totalPost : 기존값에 더해줄 값}}
                        $min : 기존값보다 적을 때만 변경
                        $rename : key값 이름변경
                */
            })
        });
    });
    console.log(req.body);
    console.log(req.body.title);
    console.log(req.body.date);
});
app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    //var id = req.body;
    db.collection('post').deleteOne(req.body, function(error, result){
        console.log('삭제완료');
        res.status(200).send({ message : '성공했습니다.'});
    });
});
app.post('/editor', function(req, res){
    res.send('전송완료');
    var id = parseInt(req.body.id);
    var tit = req.body.title;
    var date = req.body.date;
    db.collection('post').updateOne({_id : id}, {$set : {title : tit, date : date}});
});
/*
    API : Application Programming Interface(통신규약)
      - SERVER와 고객간의 요청 방식(문서 혹은 통신 규약)

    REST API : RESTFUL 한 API.
      - 1. Uniform Interface : 
        - 하나의 자료는 하나의 URL로
        - URL 하나를 알면 둘을 알 수 있도록
        - 요청과 응답의 정보는 충분히
          - URL을 명사로 작성 추천
          - 하위 문서를 나타낼 땐 /
          - 파일 확장자(.html) 쓰지말기
          - 띄어쓰기는 - 이용
          - 자료 하나당 하나의 URL
      - 2. Client-Server 역할 구분 :
        - 브라우저는 요청만
        - 서버는 응답만
      - 3. Stateless :
        - 요청1과 요청2는 의존성이 없이.
      - 4. Cacheable :
        - 서버에서 보내주는 정보들은 캐싱이 가능해야함
        - 캐싱을 위한 버전관리도 잘 해야함(브라우저가 알아서 해줌)
      - 5. Layered System
      - 6. Code on Demand

*/