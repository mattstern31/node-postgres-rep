var helper = require(__dirname + '/test-helper');
http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY

test('flushing once', function() {
  helper.connect(function(con) {
    con.parse({
      text: 'select * from ids'
    });

    con.bind();
    con.execute();
    con.flush();

    assert.raises(con, 'parseComplete');
    assert.raises(con, 'bindComplete');
    assert.raises(con, 'dataRow');
    assert.raises(con, 'commandComplete', function(){
      con.sync();
    });
    assert.raises(con, 'readyForQuery', function(){
      con.end();
    });

  });
});

test("sending many flushes", function() {
  helper.connect(function(con) {

    assert.raises(con, 'parseComplete', function(){
      con.bind();
      con.flush();
    });

    assert.raises(con, 'bindComplete', function(){
      con.execute();
      con.flush();
    });

    assert.raises(con, 'dataRow', function(msg){
      assert.equal(msg.fields[0], 1);
      assert.raises(con, 'dataRow', function(msg){
        assert.equal(msg.fields[0], 2);
        assert.raises(con, 'commandComplete', function(){
          con.sync();
        });
        assert.raises(con, 'readyForQuery', function(){
          con.end();
        });
      });
    });

    con.parse({
      text: "select * from ids order by id"
    });

    con.flush();

  });
});
