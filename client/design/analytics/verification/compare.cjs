const sharp=require(process.env.SHARP_PATH||'sharp'),path=require('node:path'),fs=require('node:fs');
const base=path.resolve(__dirname,'..');
(async()=>{
 const source=path.join(base,'references/selected-option-1.png'),render=path.join(base,'screenshots/success-1487.png');
 const a=await sharp(source).metadata(),b=await sharp(render).metadata();
 await sharp({create:{width:a.width+b.width,height:Math.max(a.height,b.height),channels:3,background:'#0b0f19'}}).composite([{input:source,left:0,top:0},{input:render,left:a.width,top:0}]).png().toFile(path.join(base,'screenshots/comparison.png'));
 const cropA=await sharp(source).extract({left:405,top:205,width:1040,height:720}).toBuffer();
 const cropB=await sharp(render).extract({left:478,top:218,width:826,height:720}).toBuffer();
 await sharp({create:{width:1866,height:720,channels:3,background:'#0b0f19'}}).composite([{input:cropA,left:0,top:0},{input:cropB,left:1040,top:0}]).png().toFile(path.join(base,'screenshots/comparison-detail.png'));
 const luminance=hex=>{const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 const pairs=[['body','f8fafc','111827'],['muted','b8c3d4','111827'],['brand','a5b4fc','111827'],['button','ffffff','4338ca'],['success','6ee7b7','111827'],['warning','fcd34d','111827'],['error','fda4af','111827'],['focus','c7d2fe','111827']];
 const ratios=pairs.map(([name,fg,bg])=>{const a=luminance(fg),b=luminance(bg);return {name,fg,bg,ratio:Number(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2))};});
 fs.writeFileSync(path.join(base,'verification/contrast.json'),JSON.stringify(ratios,null,2));console.log(JSON.stringify({source:a,render:b,ratios}));
})();
