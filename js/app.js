(function (Vue) {

	var STOREGE_KEY = "todo-items";

	//定义localstorege对象
	const itemStorage = {
		//获取本地数据的方法
		fetch:function () {
			//获取数据并且数据反序列化，变成数组对象，如果为空，则是空数组
			return JSON.parse(localStorage.getItem(STOREGE_KEY) || '[]')
		},
		//保存数据到本地，items就是需要保存的数据源,并且以JSON字符串的格式存储
		save:function (items) {
			localStorage.setItem(STOREGE_KEY,JSON.stringify(items))
		}

	};

		//自定义全局指令，获取焦点指令
	//定义时不要加v-，内部会帮你加上，使用时需要加上v-
		 Vue.directive("app-focus",{
			inserted(el,binding){
				//el表示作用的元素
				//binding表示指令后输入的内容
				el.focus()

			}


		});

	var vm = new Vue({
			el:'#todoapp',
			data:{
				// items:[
				// 	{id:1,content:'dddd',completed:false},
				// 	{id:2,content:'aaaa',completed:false},
				// 	{id:3,content:'bbbb',completed:false},
				// 	{id:4,content:'cccc',completed:false},
				// ],
				//从本地获取数据
				items:itemStorage.fetch(),

				currentItem:null,
				filterState:'all',

			},
			//监听器，用于本地化数据的存储，一旦数组对象有变化，立即存储
		    watch:{
			//监听items,一旦items发生变化就会执行
			items:{
				deep:true,//需要监听数组对象内部的变化，需要指定deep:true
				handler(newitems,olditems){
					// newitems:新的数组对象
					// olditems：之前的数组对象
					itemStorage.save(newitems)
				}
			}
			},
			//自定义局部指令，用于聚焦编辑框修改内容
			directives:{
				"todo-focus":{
					//当指令的值更新后会调用此方法
					update(el,binding){
						//el表示作用的元素
						//binding表示指令后输入的内容
						if(binding.value){
							el.focus()
						}

					}

				}
			},

			methods:{
				
				//过滤出所有未完成的任务项,并且将过滤后的数据赋值给items
				removeAllCompleted(){
					this.items= this.items.filter((item)=>!item.completed)
				},

				//通过enter以及blur事件，保存数据，只有当获取焦点才会触发该事件
				saveData(item,index,event){
					//获取对应文本框中去除空格后的内容
					const content=event.target.value.trim();
					//判断内容是否为空，如果为空，删除任务项
					if(!content){
						//重用removeItem函数删除
						this.removeItem(index)
					}
					//否则对数据进行更新
					item.content=content;
					//更新后移除编辑样式，.editing
					this.currentItem=null

				},

				//双击进入编辑模式，也就是加入.editing样式
				toEdit(item){
					this.currentItem=item
				},
				//点击键盘的esc取消编辑
				cancelEdit(){
					this.currentItem=null
				},

				//移除对象 splice()，传入移除对象的索引，以及从此处开始完后删掉的数量
				removeItem(index){
					this.items.splice(index,1)

				},

				//添加数据
				addItem(event){
					//获取文本框中的值
					const newValue=event.target.value.trim();
					//判断是否为空，如果为空什么也不做
					if(!newValue.length){
						return
					}
					//如果不为空将新值添加到数组中
					newObject={
						id:this.items.length+1, //生成一个新的id
						content:newValue,
						completed:false
					};
					this.items.push(newObject);
					//将文本框置空
					event.target.value=''
				}
			},

			computed:{
				//过滤出不同状态下的数据，以this.filterState为过滤条件
				filterItems(){
					switch (this.filterState) {
						case "active":
							return this.items.filter(item=>!item.completed);
							break
						case "completed":
							return this.items.filter(item=>item.completed);
							break
						default:
							return this.items;
							break
					}

				},
				
				incomplete(){
					//箭头函数返回未完成任务的个数
					return this.items.filter(item=>!item.completed).length
					// this.items.filter(function (item) {
					// 	return !item.completed
					// }).length
				},

				isSelectAll:{
					//循环数据源中的每一个对象，并且将通过v-model双向绑定获取的值赋给每一个item中的状态，从而根据input checkbox的状态去顶任务的状态
					set:function (newState) {
						this.items.forEach(function (item) {
							item.completed=newState;
						})
					},

					//根据任务完成的状态完成绑定v-model的input checkbox框的状态获取
					get:function () {

						return this.incomplete===0
					}

				}
			},

		});

		//获取路由hash值,并且截取需要的路由，当截取的为空时返回‘all’
		window.onhashchange=function () {
		// window.location.hash  获取的是这样的数据 #/active
			const hash=window.location.hash.substr(2) || 'all';
			//将状态值赋值给vm实例中的filterState
			vm.filterState = hash
		};

		//第一次访问生效，手动调用一次
		window.onhashchange()

})(Vue);
