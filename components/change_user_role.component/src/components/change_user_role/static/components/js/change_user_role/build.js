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

			$.ajax({
				url: "static/components/html/roles_index.html",
				dataType: 'html',
				success: function (response) {
					container.append(response);

					usersAddrs = self._findUsers();

					$("#users+.dropdown-menu").unbind('click').delegate("a", "click", function (e) {
						const typeOfUser = $("#role")[0],
							typesOfUsers = $("#roles+.dropdown-menu a"),
							save_button = $("#change_role"),
							users = $("#users+.dropdown-menu a"),
							number = users.index(e.target);
						save_button.disabled = false;
						user = usersAddrs[number + 1];
						$('#users')[0].innerText = e.target.innerText;
						self._findUserRole(user).then(data => {
							userRole = data[0];
							userConnection = data[1];
							switch (userRole) {
								case 'SUPER':
									typeOfUser.innerText = 'суперпользователь';
									save_button.disabled = true;
									break;
								case 'ORDINARY':
									typeOfUser.innerText = typesOfUsers[0].innerText;
									break;
								case 'SPECIAL':
									typeOfUser.innerText = typesOfUsers[1].innerText;
									break;
								case 'UNDEFINED':
									typeOfUser.innerText = 'тип пользователя не задан';
									break;
							}
						});
					});

					$("#roles+.dropdown-menu").unbind('click').delegate("a", "click", function (e) {
						const roles = $("#roles+.dropdown-menu a"),
							number = roles.index(e.target),
							typeOfUser = roles[number].innerText;
							$('#roles')[0].innerText = typeOfUser;
						switch (typeOfUser) {
							case 'обычный пользователь':
								userRole = 'ORDINARY';
								break;
							case 'специальный пользователь':
								userRole = 'SPECIAL';
								break;
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

		_findUsers() {
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
		_findUserRole(userAddr) {
			return new Promise(resolve => {
				let TYPE_OF_USER = ['SUPER', 'ORDINARY', 'SPECIAL', 'UNDEFINED'],
					isSuperUser, isOrdinaryUser, isSpecialUser;

				this._isSuperUser(userAddr)
					.then(superUser => {
						isSuperUser = superUser;
						return this._isOrdinaryUser(userAddr);
					}).then(ordinaryUser => {
						isOrdinaryUser = ordinaryUser;
						return this._isSpecialUser(userAddr);
					}).then(specialUser => {
						isSpecialUser = specialUser;
						if (isSuperUser) {
							resolve([TYPE_OF_USER[0], isSuperUser]);
						} else if (isOrdinaryUser) {
							resolve([TYPE_OF_USER[1], isOrdinaryUser]);
						} else if (isSpecialUser) {
							resolve([TYPE_OF_USER[2], isSpecialUser]);
						} else {
							resolve([TYPE_OF_USER[3]]);
						}
					});
			});
		},

		_isOrdinaryUser(userAddr) {
			return new Promise(resolve => {
				let nrel_ordinary_user, myself, indef;
				// Resolve sc-addrs.
				SCWeb.core.Server.resolveScAddr(['nrel_ordinary_user', 'Myself'], function (keynodes) {
					nrel_ordinary_user = keynodes['nrel_ordinary_user'];
					myself = keynodes['Myself'];
					// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_F_A_F, [
						myself,
						sc_type_arc_common | sc_type_const,
						userAddr,
						sc_type_arc_pos_const_perm,
						nrel_ordinary_user
					]).
					done(function (identifiers) {
						resolve(identifiers[0][1]);
					}).fail(function () {
						resolve();
					});
				});
			});
		},
		_isSpecialUser(userAddr) {
			return new Promise(resolve => {
				let nrel_special_user, myself, indef;
				// Resolve sc-addrs.
				SCWeb.core.Server.resolveScAddr(['nrel_special_user', 'Myself'], function (keynodes) {
					nrel_special_user = keynodes['nrel_special_user'];
					myself = keynodes['Myself'];
					// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_F_A_F, [
						myself,
						sc_type_arc_common | sc_type_const,
						userAddr,
						sc_type_arc_pos_const_perm,
						nrel_special_user
					]).
					done(function (identifiers) {
						resolve(identifiers[0][1]);
					}).fail(function () {
						resolve();
					});
				});
			});
		},
		_isSuperUser(userAddr) {
			return new Promise(resolve => {
				let nrel_super_user, myself, indef;
				// Resolve sc-addrs.
				SCWeb.core.Server.resolveScAddr(['nrel_super_user', 'Myself'], function (keynodes) {
					nrel_super_user = keynodes['nrel_super_user'];
					myself = keynodes['Myself'];
					// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_F_A_F, [
						myself,
						sc_type_arc_common | sc_type_const,
						userAddr,
						sc_type_arc_pos_const_perm,
						nrel_super_user
					]).
					done(function (identifiers) {
						resolve(identifiers[0][1]);
					}).fail(function () {
						resolve();
					});
				});
			});
		},

		_deleteOldRole(userConnection) {
			let garbage;
			SCWeb.core.Server.resolveScAddr(['sc_garbage'], function (keynodes) {
				garbage = keynodes['sc_garbage'];
				window.sctpClient.create_arc(sc_type_arc_pos_const_perm | sc_type_const, garbage, userConnection);
			});
		},
		_chooseRole(user, userRole) {
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
		_save (user, userRole, userConnection) {
			var self = this;

			if (userConnection) {
				this._deleteOldRole(userConnection);
			}

			switch (userRole) {
				case 'ORDINARY':
					this._chooseRole(user, 'nrel_ordinary_user');
					break;
				case 'SPECIAL':
					this._chooseRole(user, 'nrel_special_user');
					break;
			}
			$('#users')[0].innerHTML = 'Выберите пользователя<span class="caret"></span>';
			$('#roles')[0].innerHTML = 'Выберите роль<span class="caret"></span>';
			$('#role')[0].innerHTML = '';
		}
	};

/* --- src/change-user-role-component-drawer.js --- */
/**
 * ChangeUserRole component.
 */
ChangeUserRole.DrawComponent = {
    ext_lang: 'change_user_role',
    formats: ['format_change_user_role_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new ChangeUserRole.DrawWindow(sandbox);
    }
};

ChangeUserRole.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new ChangeUserRole.PaintPanel(this.sandbox.container);
    this.paintPanel.init();
    this.recieveData = function (data) {
        console.log("in recieve data" + data);
    };

    var scElements = {};

    function drawAllElements() {
        var dfd = new jQuery.Deferred();
       // for (var addr in scElements) {
            jQuery.each(scElements, function(j, val){
                var obj = scElements[j];
                if (!obj || obj.translated) return;
// check if object is an arc
                if (obj.data.type & sc_type_arc_pos_const_perm) {
                    var begin = obj.data.begin;
                    var end = obj.data.end;
                    // logic for component update should go here
                }

        });
        SCWeb.ui.Locker.hide();
        dfd.resolve();
        return dfd.promise();
    }

// resolve keynodes
    var self = this;
    this.needUpdate = false;
    this.requestUpdate = function () {
        var updateVisual = function () {
// check if object is an arc
            var dfd1 = drawAllElements();
            dfd1.done(function (r) {
                return;
            });


/// @todo: Don't update if there are no new elements
            window.clearTimeout(self.structTimeout);
            delete self.structTimeout;
            if (self.needUpdate)
                self.requestUpdate();
            return dfd1.promise();
        };
        self.needUpdate = true;
        if (!self.structTimeout) {
            self.needUpdate = false;
            SCWeb.ui.Locker.show();
            self.structTimeout = window.setTimeout(updateVisual, 1000);
        }
    }
    
    this.eventStructUpdate = function (added, element, arc) {
        window.sctpClient.get_arc(arc).done(function (r) {
            var addr = r[1];
            window.sctpClient.get_element_type(addr).done(function (t) {
                var type = t;
                var obj = new Object();
                obj.data = new Object();
                obj.data.type = type;
                obj.data.addr = addr;
                if (type & sc_type_arc_mask) {
                    window.sctpClient.get_arc(addr).done(function (a) {
                        obj.data.begin = a[0];
                        obj.data.end = a[1];
                        scElements[addr] = obj;
                        self.requestUpdate();
                    });
                }
            });
        });
    };
// delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
    this.sandbox.updateContent();
};
SCWeb.core.ComponentManager.appendComponentInitialize(ChangeUserRole.DrawComponent);

