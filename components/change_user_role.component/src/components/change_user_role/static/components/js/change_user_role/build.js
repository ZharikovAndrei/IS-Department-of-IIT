/* --- src/change-user-role-implementation.js --- */
var ChangeUserRole = {};

function extend(child, parent) {
var F = function () {
};
F.prototype = parent.prototype;
child.prototype = new F();
child.prototype.constructor = child;
child.superclass = parent.prototype;
}


/* --- src/change-user-role-main.js --- */
/**
 * Paint panel.
 */

ChangeUserRole.PaintPanel = function (containerId) {
	this.containerId = containerId;
};

ChangeUserRole.PaintPanel.prototype = {

	init: function () {
		this._initMarkup(this.containerId);
	},

	_initMarkup: function (containerId) {
		var container = $('#' + containerId);

		var self = this;
		var usersAddrs, userRole, userConnection, user;
		console.log('HI!!!');
		$.ajax({
			url: "static/components/html/index.html",
			dataType: 'html',
			success: function (response) {
				container.append(response);

				usersAddrs = self._findUsers();

				$("#users+.dropdown-menu").unbind('click').delegate("a", "click", async function (number) {
					const typeOfUser = $("#role"),
						typesOfUsers = $("#roles+.dropdown-menu a"),
						save_button = $("#change_role");
					save_button.disabled = false;
					user = usersAddrs[+number];
					userRole = await self._findUserRole.call(self, user, userConnection);
					switch (userRole) {
						case 'SUPER': typeOfUser.innerText = 'суперпользователь'; save_button.disabled = true; break;
						case 'ORDINARY': typeOfUser.innerText = typesOfUsers[0].innerText; break;
						case 'SPECIAL': typeOfUser.innerText = typesOfUsers[1].innerText; break;
						case 'UNDEFINED': typeOfUser.innerText = 'тип пользователя не задан'; break;
					}
				});

				$("#roles+.dropdown-menu").unbind('click').delegate("a", "click", function (number) {
					const typeOfUser = $("#roles+.dropdown-menu a")[+number];
					switch (typeOfUser) {
						case 'обычный пользователь': userRole = 'ORDINARY'; break;
						case 'специальный пользователь': userRole = 'SPECIAL'; break;
					}
				});

				$('#change_role').unbind('click').click(function () {
					self._save(user, userRole, userConnection);
				});
			},
			error: function () {
				console.log("Error to get external html");
			}
		});
		container.append('<div class="sc-no-default-cmd">Компонент для назначения/смены вида пользователя</div>');

	},

	_findUsers () {
		const usersAddrs = [];
		let user_addr;
		// Resolve sc-addrs.
		SCWeb.core.Server.resolveScAddr(['ui_user'], function (keynodes) {
			user_addr = keynodes['ui_user'];
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
				user_addr,
				sc_type_arc_pos_const_perm | sc_type_const,
				sc_type_node
			]).
			done(function (identifiers) {
				const dropdown = $("#users+.dropdown-menu");
				identifiers.forEach((item) => {
					usersAddrs.push(item[2]);
					window.scHelper.getIdentifier(item[2], scKeynodes.lang_ru).done(function (content) {
						dropdown.append(`<li><a href="#">${content}</a></li>`);
					});
				});

			});
		});
		return usersAddrs;
	},
	_findUserRole: async function (userAddr, userConnection) {
		let TYPE_OF_USER = ['SUPER', 'ORDINARY', 'SPECIAL', 'UNDEFINED'];
		const isSuperUser = await this._isSuperUser(userAddr);
		const isOrdinaryUser = await this._isOrdinaryUser(userAddr);
		const isSpecialUser = await this._isSpecialUser(userAddr);

		if (isSuperUser) {
			return TYPE_OF_USER[0];
		} else if (isOrdinaryUser) {
			userConnection = isOrdinaryUser;
			return TYPE_OF_USER[1];
		} else if (isSpecialUser) {
			userConnection = isSpecialUser;
			return TYPE_OF_USER[2];
		} else {
			return TYPE_OF_USER[3];
		}
	},

	_isOrdinaryUser (userAddr) {
		let nrel_ordinary_user, myself, userAddr, indef;
		// Resolve sc-addrs.
		SCWeb.core.Server.resolveScAddr(['nrel_ordinary_user', 'Myself'], function (keynodes) {
			nrel_ordinary_user = keynodes['nrel_ordinary_user'];
			myself = keynodes['Myself'];
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
				myself,
				sc_type_arc_common | sc_type_const,
				userAddr,
				sc_type_arc_pos_const_perm,
				nrel_ordinary_user
			]).
			done(function (identifiers) {
				indef = identifiers[0][1];
			});
		});
		return indef;
	},
	_isSpecialUser (userAddr) {
		let nrel_special_user, myself, userAddr, indef;
		// Resolve sc-addrs.
		SCWeb.core.Server.resolveScAddr(['nrel_special_user', 'Myself'], function (keynodes) {
			nrel_special_user = keynodes['nrel_special_user'];
			myself = keynodes['Myself'];
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
				myself,
				sc_type_arc_common | sc_type_const,
				userAddr,
				sc_type_arc_pos_const_perm,
				nrel_special_user
			]).
			done(function (identifiers) {
				indef = identifiers[0][1];
			});
		});
		return indef;
	},
	_isSuperUser (userAddr) {
		let nrel_super_user, myself, userAddr, indef;
		// Resolve sc-addrs.
		SCWeb.core.Server.resolveScAddr(['nrel_super_user', 'Myself'], function (keynodes) {
			nrel_super_user = keynodes['nrel_super_user'];
			myself = keynodes['Myself'];
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
				myself,
				sc_type_arc_common | sc_type_const,
				userAddr,
				sc_type_arc_pos_const_perm,
				nrel_super_user
			]).
			done(function (identifiers) {
				indef = identifiers[0][1];
			});
		});
		return indef;
	},

	_deleteOldRole (userConnection) {
		let garbage;
		SCWeb.core.Server.resolveScAddr(['sc_garbage'], function (keynodes) {
			garbage = keynodes['sc_garbage'];
			window.sctpClient.create_arc(sc_type_arc_pos_const_perm | sc_type_const, garbage, userConnection);
		});
	},
	_chooseRole (user, userRole) {
		let myself, userConnection;
		SCWeb.core.Server.resolveScAddr([userRole, 'Myself'], function (keynodes) {
			userConnection = keynodes[userRole];
			myself = keynodes['Myself'];
			window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, myself, user).done(function (generatedCommonArc) {
				window.sctpClient.create_arc(sc_type_arc_pos_const_perm, userConnection, generatedCommonArc).done(function (arc) {
					toastr.success('Сохранено');
				});
			});
		});
	},
	_save: async function (user, userRole, userConnection) {
		var self = this;

		if (userConnection) {
			await this._deleteOldRole(userConnection);
		}

		switch (userRole) {
			case 'ORDINARY': await this._chooseRole(user, 'nrel_ordinary_user'); break;
			case 'SPECIAL': await this._chooseRole(user, 'nrel_special_user'); break;
		}
	}
};

