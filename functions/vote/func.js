const fdk=require('@autom8/fdk');
const a8=require('@autom8/js-a8-fdk')

fdk.handle(function(input){
  let name = 'World';
  if (input.name) {
    name = input.name;
  }
  return {'message': 'Hello ' + name}
})
