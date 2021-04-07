const ObjectId = require('mongoose').Types.ObjectId;
const Todolist = require('../models/todolist-model');

// The underscore param, "_", is a wildcard that can represent any value;
// here it is a stand-in for the parent parameter, which can be read about in
// the Apollo Server documentation regarding resolvers

module.exports = {
	Query: {
		/** 
		 	@param 	 {object} req - the request object containing a user id
			@returns {array} an array of todolist objects on success, and an empty array on failure
		**/
		getAllTodos: async (_, __, { req }) => {
			const _id = new ObjectId(req.userId);
			if(!_id) { return([])};
			const todolists = await Todolist.find({owner: _id});
			if(todolists) return (todolists);

		},
		/** 
		 	@param 	 {object} args - a todolist id
			@returns {object} a todolist on success and an empty object on failure
		**/
		getTodoById: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const todolist = await Todolist.findOne({_id: objectId});
			if(todolist) return todolist;
			else return ({});
		},
	},
	Mutation: {
		/** 
		 	@param 	 {object} args - a todolist id and an empty item object
			@returns {string} the objectID of the item or an error message
		**/
		addItem: async(_, args) => {
			const { _id, item, index } = args;
			const listId = new ObjectId(_id);
			const objectId = new ObjectId();
			const found = await Todolist.findOne({_id: listId});
			if(!found) return ('Todolist not found');
			item._id = objectId;
			let listItems = found.items;

			if(index < 0) listItems.push(item);
  			else listItems.splice(index, 0, item);

			const updated = await Todolist.updateOne({_id: listId}, { items: listItems });

			if(updated) return (objectId);
			else return ('Could not add item');
		},
		/** 
		 	@param 	 {object} args - an empty todolist object
			@returns {string} the objectID of the todolist or an error message
		**/
		addTodolist: async (_, args) => {
			const { todolist } = args;
			const objectId = new ObjectId();
			const { id, name, owner, items } = todolist;
			const newList = new Todolist({
				_id: objectId,
				id: id,
				name: name,
				owner: owner,
				items: items
			});
			const updated = await newList.save();
			if(updated) return objectId;
			else return ('Could not add todolist');
		},
		/** 
		 	@param 	 {object} args - a todolist objectID and item objectID
			@returns {array} the updated item array on success or the initial 
							 array on failure
		**/
		deleteItem: async (_, args) => {
			const  { _id, itemId } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			listItems = listItems.filter(item => item._id.toString() !== itemId);
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);

		},
		/** 
		 	@param 	 {object} args - a todolist objectID 
			@returns {boolean} true on successful delete, false on failure
		**/
		deleteTodolist: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const deleted = await Todolist.deleteOne({_id: objectId});
			if(deleted) return true;
			else return false;
		},
		/** 
		 	@param 	 {object} args - a todolist objectID, field, and the update value
			@returns {boolean} true on successful update, false on failure
		**/
		updateTodolistField: async (_, args) => {
			const { field, value, _id } = args;
			const objectId = new ObjectId(_id);
			const updated = await Todolist.updateOne({_id: objectId}, {[field]: value});
			if(updated) return value;
			else return "";
		},
		/** 
			@param	 {object} args - a todolist objectID, an item objectID, field, and
									 update value. Flag is used to interpret the completed 
									 field,as it uses a boolean instead of a string
			@returns {array} the updated item array on success, or the initial item array on failure
		**/
		updateItemField: async (_, args) => {
			const { _id, itemId, field,  flag } = args;
			let { value } = args
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			if(flag === 1) {
				if(value === 'complete') { value = true; }
				if(value === 'incomplete') { value = false; }
			}
			listItems.map(item => {
				if(item._id.toString() === itemId) {	
					
					item[field] = value;
				}
			});
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);
		},
		/**
			@param 	 {object} args - contains list id, item to swap, and swap direction
			@returns {array} the reordered item array on success, or initial ordering on failure
		**/
		reorderItems: async (_, args) => {
			const { _id, itemId, direction } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			const index = listItems.findIndex(item => item._id.toString() === itemId);
			// move selected item visually down the list
			if(direction === 1 && index < listItems.length - 1) {
				let next = listItems[index + 1];
				let current = listItems[index]
				listItems[index + 1] = current;
				listItems[index] = next;
			}
			// move selected item visually up the list
			else if(direction === -1 && index > 0) {
				let prev = listItems[index - 1];
				let current = listItems[index]
				listItems[index - 1] = current;
				listItems[index] = prev;
			}
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			// return old ordering if reorder was unsuccessful
			listItems = found.items;
			return (found.items);

		},

		sortItems: async (_,args) => {
			//SORT LIST
			const {_id, opcode } = args;
			const listId = new ObjectId(_id);
			let list = await Todolist.findOne({_id: listId});
			let items = list.items;
			let oldItems = [];
			for(let i = 0; i < items.length; i++) {
				oldItems[i] = items[i];
			}
			let updated;
			if(opcode === 0) {
				let sorted = true;
				for(let i = 0; i < items.length - 1; i++) {
					if(items[i].description > items[i + 1].description) {
						sorted = false;
						break;
					}
				}
				if(!sorted){
					for(let i = 0; i < items.length; i++) {
						for(let j = 0; j < items.length - 1 - i; j++) {
							if(items[j].description > items[j+1].description) {
								let temp = items[j];
								items[j] = items[j+1];
								items[j+1] = temp;
							}
						}
					}
				}
				else{
					for(let i = 0; i < items.length; i++) {
						for(let j = 0; j < items.length - 1 - i; j++) {
							if(items[j].description < items[j+1].description) {
								let temp = items[j];
								items[j] = items[j+1];
								items[j+1] = temp;
							}
						}
					}
				}
				updated = await Todolist.updateOne({_id: listId}, {items: items});
			}
			if(opcode === 1) {
				let sorted = true;
				for(let i = 0; i < items.length - 1; i++) {
					if(items[i].due_date > items[i + 1].due_date) {
						sorted = false;
						break;
					}
				}
				if(!sorted){
					for(let i = 0; i < items.length; i++) {
						for(let j = 0; j < items.length - 1 - i; j++) {
							if(items[j].due_date > items[j+1].due_date) {
								let temp = items[j];
								items[j] = items[j+1];
								items[j+1] = temp;
							}
						}
					}
				}
				else{
					for(let i = 0; i < items.length; i++) {
						for(let j = 0; j < items.length - 1 - i; j++) {
							if(items[j].due_date < items[j+1].due_date) {
								let temp = items[j];
								items[j] = items[j+1];
								items[j+1] = temp;
							}
						}
					}
				}
				updated = await Todolist.updateOne({_id: listId}, {items: items});
			}
			if(opcode === 2) {
				let sorted = true;
				for(let i = 0; i < items.length - 1; i++) {
					if(items[i].completed > items[i + 1].completed) {
						sorted = false;
						break;
					}
				}
				if(!sorted){
					for(let i = 0; i < items.length; i++) {
						for(let j = 0; j < items.length - 1 - i; j++) {
							if(items[j].completed > items[j+1].completed) {
								let temp = items[j];
								items[j] = items[j+1];
								items[j+1] = temp;
							}
						}
					}
				}
				else{
					for(let i = 0; i < items.length; i++) {
						for(let j = 0; j < items.length - 1 - i; j++) {
							if(items[j].completed < items[j+1].completed) {
								let temp = items[j];
								items[j] = items[j+1];
								items[j+1] = temp;
							}
						}
					}
				}
				updated = await Todolist.updateOne({_id: listId}, {items: items});
			}
			if(updated) {
				items = list.items;
			}
			let oldString = '';
			for(let i = 0; i < oldItems.length; i++) {
				oldString += oldItems[i].id;
				if(i < oldItems.length - 1) {
					oldString+='-';
				}
			}
			return oldString;
		},

		changeItemOrder: async (_, args) => {
			const { _id, oldOrder } = args;
			const listId = new ObjectId(_id);
			let list = await Todolist.findOne({_id: listId});
			oldOrderArr = oldOrder.split("-");
			let newItems = [];
			for(let i = 0; i < oldOrderArr.length; i++) {
				for(let j = 0; j < list.items.length; j++) {
					if(list.items[j].id == oldOrderArr[i]) {
						newItems[i] = list.items[j];
					}
				}
			}
			let updated = await Todolist.updateOne({_id: listId}, {items: newItems});
			return 'hello';
		}

	}
}