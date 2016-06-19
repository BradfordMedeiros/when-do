

/*logic.set_default_rate(x)
logic.conditions = [ ]
logic.pause(identifier)
logic.resume(identifier)
logic.stop(identifier)
logic.save(conditions)
logic.load(conditions)

logic.when(function(){ return 2==2}).do(
	function(){console.log('hello')}, 
    
		{
			rate: 200 
			limit: 5
			evaluate: 5000 // check every second (defaults to 1000)
		} 
	);

r = logic.when( logic.and(()=> true,()=>true))).do(()=>{}))
r.stop()
r.pause()
r.resume()

logic.when(object, eval(object)).do()

data = { humidity: 10}
logic.when(data, function(){},

logic.when(object, logic.lessthan({humidity:3})*/
