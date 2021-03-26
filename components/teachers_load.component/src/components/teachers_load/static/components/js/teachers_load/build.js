/* --- src/extend-implementation.js --- */
var Example = {};

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/main.js --- */
	/**
	 * Paint panel.
	 */

	Example.PaintPanel = function (containerId) {
		this.containerId = containerId;
	};

	Example.PaintPanel.prototype = {

		init: function () {
			this._initMarkup(this.containerId);
		},

		_initMarkup: function (containerId) {
			var container = $('#' + containerId);

			var self = this;
			var teachersAddr, subjectsAddr;
			var rate,
				rateHours = 0,
				subjectTypesAddr,
				sumTeachersHours,
				plannedHours,
				realSubjectTypeHours,
				realSubjectTypeHoursAmount = 0,
				currentSubjectTypeHours,
				arcAddrToErase = [];
			$.ajax({
				url: "static/components/html/index.html",
				dataType: 'html',
				success: function (response) {
					container.append(response);

					teachersAddr = self._findTeachers();
					$("#teachers+.dropdown-menu").unbind('click').delegate("a", "click", function (event) {
						$("#teachers").text(event.target.innerText);
						$("div.dropdown.hidden").removeClass("hidden");
						$("#subject").html('Выберите предмет <span class="caret"></span>');
						$(".workWithHours").addClass("hidden");
						$("div.dropdown").get(2).classList.add("hidden");

						const index = $("#teachers+.dropdown-menu li a").index(event.target);
						rate = self._findTeacherInfo(teachersAddr[index + 1], 'nrel_rate');

						subjectsAddr = self._findSubject(teachersAddr[index + 1]);

						$("#subject+.dropdown-menu").unbind('click').delegate("a", "click", function (event) {
							$("#subject").text(event.target.innerText);
							$("div.dropdown.hidden").removeClass("hidden");
							$("#subjectType").html('Выберите учебную деятельность <span class="caret"></span>');
							$(".workWithHours").addClass("hidden");



							workHourForErase = [];
							const name = $("#subject+.dropdown-menu li a").index(event.target);
							subjectTypesAddr = self._findSubjectType(teachersAddr[index + 1], event.target.innerText);

							$("#subjectType+.dropdown-menu").unbind('click').delegate("a", "click", function (event) {

								$(".workWithHours").removeClass("hidden");
								$("#subjectType").text(event.target.innerText);
								const subjectType = $("#subjectType+.dropdown-menu li a").index(event.target);
								realSubjectTypeHoursAmount = 0;
								arcAddrToErase.length = 0;

								new Promise(function (resolve, reject) {
									realSubjectTypeHours = self._findAllSubjectTypeHours(subjectTypesAddr[subjectType]);
									plannedHours = self._findSubjectHours(subjectTypesAddr[subjectType]);
									currentSubjectTypeHours = self._findCurrentHours(teachersAddr[index + 1], subjectTypesAddr[subjectType], arcAddrToErase);
									sumTeachersHours = self._findTeacherInfo(teachersAddr[index + 1], 'nrel_load');
									setTimeout(() => {
										resolve()
									}, 2000);
								}).then(response => {
									if (!currentSubjectTypeHours[0]) currentSubjectTypeHours[0] = 0;
									rateHours = rate[0] * 820;
									realSubjectTypeHours.forEach(item => {
										realSubjectTypeHoursAmount += item;
									});
									if (!sumTeachersHours[0]) {
										sumTeachersHours[0] = 0;
									}
									self._renderTable(realSubjectTypeHoursAmount, plannedHours[0], rateHours, sumTeachersHours[0], currentSubjectTypeHours[0]);
									$('#save').unbind('click').click(function () {

										const hoursAmount = Number($('#hoursAmount').val());
										$('#hoursAmount').val('');

										if (!hoursAmount) {
											toastr.warning('Проверьте правильность введеных данных');
										} else if (rateHours + currentSubjectTypeHours[0] - sumTeachersHours[0] < hoursAmount) {
											toastr.error('Превышено кол-во часов преподавателя');
										} else if (plannedHours[0] + currentSubjectTypeHours[0] - realSubjectTypeHoursAmount < hoursAmount) {
											toastr.error('Превышено кол-во часов по учебной деятельности');
										} else {
											self._save(hoursAmount, teachersAddr[index + 1], subjectTypesAddr[subjectType], currentSubjectTypeHours, arcAddrToErase);
										}
									});
								});
							});
						});
					});
				},
				error: function () {
					console.log("Error to get external html");
				}
			});
			container.append('<div class="sc-no-default-cmd">Компонент для учета учебной нагрузки преподавателей</div>');

		},
		_findAllSubjectTypeHours: function (subjectTypeAddr) {
			var nrel_educational_work, nrel_hours_amount, hours = [];
			// Resolve sc-addrs.

			SCWeb.core.Server.resolveScAddr(['nrel_educational_work', 'nrel_hours_amount'], function (keynodes) {
				nrel_educational_work = keynodes['nrel_educational_work'];
				nrel_hours_amount = keynodes['nrel_hours_amount'];
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
					subjectTypeAddr,
					sc_type_arc_common | sc_type_const,
					sc_type_node,
					sc_type_arc_pos_const_perm,
					nrel_educational_work
				]).
				done(function (identifiers) {
					identifiers.forEach(item => {
						window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
							item[1],
							sc_type_arc_common | sc_type_const,
							sc_type_node,
							sc_type_arc_pos_const_perm,
							nrel_hours_amount
						]).
						done(function (hoursIdtf) {
							window.scHelper.getSystemIdentifier(hoursIdtf[0][2]).done(function (content) {
								console.log('nrel_hours_amount', content);
								hours.push(Number(content));
							});
						});
					});
				});
			});
			return hours;

		},
		_findAllTeachersHours: function (teacherAddr) {
			var nrel_educational_work, nrel_hours_amount, hours = [];
			// Resolve sc-addrs.

			SCWeb.core.Server.resolveScAddr(['nrel_educational_work', 'nrel_hours_amount'], function (keynodes) {
				nrel_educational_work = keynodes['nrel_educational_work'];
				nrel_hours_amount = keynodes['nrel_hours_amount'];
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F, [
					sc_type_node,
					sc_type_arc_common | sc_type_const,
					teacherAddr,
					sc_type_arc_pos_const_perm,
					nrel_educational_work
				]).
				done(function (identifiers) {
					identifiers.forEach(item => {
						window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
							item[1],
							sc_type_arc_common | sc_type_const,
							sc_type_node,
							sc_type_arc_pos_const_perm,
							nrel_hours_amount
						]).
						done(function (hoursIdtf) {
							window.scHelper.getSystemIdentifier(hoursIdtf[0][2]).done(function (content) {
								console.log('teachers hours', content);
								hours.push(Number(content));
							});
						});
					});
				});
			});
			return hours;

		},
		_findSubjectType: function (teacherAddr, subjectName) {
			$("#subjectType+.dropdown-menu li").empty();
			var subjectTypeAddrs = [];
			var nrel_educational_work;
			// Resolve sc-addrs.
			SCWeb.core.Server.resolveScAddr(['nrel_educational_work'], function (keynodes) {
				nrel_educational_work = keynodes['nrel_educational_work'];
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F, [
					sc_type_node,
					sc_type_arc_common | sc_type_const,
					teacherAddr,
					sc_type_arc_pos_const_perm,
					nrel_educational_work

				]).
				done(function (identifiers) {
					const dropdown = $("#subjectType+.dropdown-menu");
					identifiers.forEach((item) => {
						//teachersAddrs.push(item[0]);
						window.scHelper.getIdentifier(item[0], scKeynodes.lang_ru).done(function (content) {
							if (content.startsWith(subjectName)) {
								dropdown.append(`<li><a href="#">${content}</a></li>`);
								subjectTypeAddrs.push(item[0]);
							}
						});
					});

				});
			});
			return subjectTypeAddrs;
		},
		_renderTable: function (realSubjectTypeHoursAmount, plannedHours, rate, teachers, currentSubjectTypeHours) {

			const header = $('.table>thead>tr');
			const body = $('.table>tbody>tr');
			header.empty();
			body.empty();

			if (plannedHours) {
				header.append('<td>Оставшиеся часы по виду деятельности дисциплины</td>');
				body.append(`<td>${plannedHours-realSubjectTypeHoursAmount}</td>`);
			}
			if (rate) {
				header.append('<td>Доступные часы преподавателя</td>');
				body.append(`<td>${rate-teachers}</td>`);
			}
			if (currentSubjectTypeHours) {
				header.append('<td>Текущее количество часов преподавателя по данной уч.деятельности</td>');
				body.append(`<td>${currentSubjectTypeHours}</td>`);
			}
		},
		_save: function (hoursAmount, teacherAddr, subjectTypeAddr, currentHours, arcAddrToErase) {
			var self = this;

			var nrel_load, nrel_sum_of_numbers, nrel_work_hours, number, hoursAddr, nrel_system_identifier, nrel_hours_amount, nrel_educational_work, allTeachersHours, sumArc = [],
				decomp;

			SCWeb.core.Server.resolveScAddr(['nrel_load', 'nrel_sum_of_numbers', 'number', 'nrel_system_identifier', 'nrel_hours_amount', 'nrel_educational_work'], function (keynodes) {
				nrel_load = keynodes['nrel_load'];
				nrel_sum_of_numbers = keynodes['nrel_sum_of_numbers'];
				nrel_system_identifier = keynodes['nrel_system_identifier'];
				number = keynodes['number'];
				nrel_hours_amount = keynodes['nrel_hours_amount'];
				nrel_educational_work = keynodes['nrel_educational_work'];
				// находим узел суммы
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
					teacherAddr,
					sc_type_arc_common | sc_type_const,
					sc_type_node,
					sc_type_arc_pos_const_perm,
					nrel_load
				]).done(function (identifiers) {
					//находим узел а-ля декомпозиция
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F, [
						sc_type_node,
						sc_type_arc_common | sc_type_const,
						identifiers[0][2],
						sc_type_arc_pos_const_perm,
						nrel_sum_of_numbers
					]).done(function (commons) {
						sumArc.push(identifiers[0][1]);
						sumArc.push(commons[0][1]);
						decomp = commons[0][0];
						//проверка на имение уже узла с часами именно по этой дисциплине
						if (currentHours[0]) {
							console.log(arcAddrToErase);

							window.sctpClient.create_arc(sc_type_arc_pos_const_perm | sc_type_const, arcAddrToErase[0], arcAddrToErase[1]);
							window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F, [
								commons[0][0],
								sc_type_arc_pos_const_perm | sc_type_const,
								currentHours[1]
							]).done((i) => {
								window.sctpClient.create_arc(sc_type_arc_pos_const_perm | sc_type_const, arcAddrToErase[0], i[0][1]);
							});

						}
						// генерация узла числа, если его нет
						window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
							number,
							sc_type_arc_pos_const_perm | sc_type_const,
							sc_type_node
						]).
						done(function (identifiers) {
							new Promise(function (resolve) {
								identifiers.forEach(item => {
									window.scHelper.getSystemIdentifier(item[2]).done(function (content) {
										if (content == hoursAmount) {
											resolve(item[2]);
										}
									});
								});
								window.sctpClient.create_node(sc_type_node).done(function (generatedNode) {
									window.sctpClient.create_link().done(function (generatedLink) {
										window.sctpClient.set_link_content(generatedLink, String(hoursAmount));
										window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, generatedNode, generatedLink).done(function (generatedCommonArc) {
											window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_system_identifier, generatedCommonArc).done(function () {
												window.sctpClient.create_arc(sc_type_arc_pos_const_perm, number, generatedNode).done(function () {
													console.log('generated', generatedNode, hoursAmount);
													resolve(generatedNode);
												});
											});
										});
									});
								});

							}).
							then((response) => {
								//генерация нового узла для уч деятельности
								return new Promise(function (resolve) {
									hoursAddr = response;
									window.sctpClient.create_arc(sc_type_arc_pos_const_perm, commons[0][0], hoursAddr);

									window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_F_A_F, [
										subjectTypeAddr,
										sc_type_arc_common | sc_type_const,
										teacherAddr,
										sc_type_arc_pos_const_perm,
										nrel_educational_work
									]).done((idtf) => {
										window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, idtf[0][1], hoursAddr).done(function (generatedCommonArc) {
											window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_hours_amount, generatedCommonArc);
											resolve();
										});
									});

								}).then(response => {
									return new Promise(resolve => {
										allTeachersHours = self._findAllTeachersHours(teacherAddr);
										setTimeout(() => resolve(), 1000);
									});
								}).then(response => {
									const allTeachersHoursAmount = allTeachersHours.reduce((acc, item) => acc += item);



									window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
										number,
										sc_type_arc_pos_const_perm | sc_type_const,
										sc_type_node
									]).
									done(function (identifiers) {
										new Promise(function (resolve) {
											identifiers.forEach(item => {
												window.scHelper.getSystemIdentifier(item[2]).done(function (content) {
													if (content == allTeachersHoursAmount) {
														resolve(item[2]);
													}
												});
											});
											window.sctpClient.create_node(sc_type_node).done(function (generatedNode) {
												window.sctpClient.create_link().done(function (generatedLink) {
													window.sctpClient.set_link_content(generatedLink, String(allTeachersHoursAmount));
													window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, generatedNode, generatedLink).done(function (generatedCommonArc) {
														window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_system_identifier, generatedCommonArc).done(function () {
															window.sctpClient.create_arc(sc_type_arc_pos_const_perm, number, generatedNode).done(function () {
																console.log('generated', generatedNode, allTeachersHoursAmount);
																resolve(generatedNode);
															});
														});
													});
												});
											});

										}).then(response => {
											window.sctpClient.create_arc(sc_type_arc_pos_const_perm | sc_type_const, arcAddrToErase[0], sumArc[0]);
											window.sctpClient.create_arc(sc_type_arc_pos_const_perm | sc_type_const, arcAddrToErase[0], sumArc[1]);
											window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, decomp, response).done(function (sum_nrel) {
												window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_sum_of_numbers, sum_nrel);
											});
											window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, teacherAddr, response).done(function (load_nrel) {
												window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_load, load_nrel);
												toastr.success('Сохранено');
											});
										});
									});

								});

							});

						});

					})
				});
			});


		},

		_findTeachers: function () {
			var teacher_addr;
			var teachersAddrs = [];
			// Resolve sc-addrs.
			SCWeb.core.Server.resolveScAddr(['teacher'], function (keynodes) {
				teacher_addr = keynodes['teacher'];
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
					teacher_addr,
					sc_type_arc_pos_const_perm | sc_type_const,
					sc_type_node
				]).
				done(function (identifiers) {
					const dropdown = $("#teachers+.dropdown-menu");
					identifiers.forEach((item) => {
						teachersAddrs.push(item[2]);
						window.scHelper.getIdentifier(item[2], scKeynodes.lang_ru).done(function (content) {
							dropdown.append(`<li><a href="#">${content}</a></li>`);
						});
					});

				});
			});
			return teachersAddrs;
		},
		_findSubject: function (teacherName) {
			$("#subject+.dropdown-menu li").empty();
			var can_teach_addr;
			var subjectsAddrs = [];
			// Resolve sc-addrs.
			SCWeb.core.Server.resolveScAddr(['nrel_can_teach_subject'], function (keynodes) {
				can_teach_addr = keynodes['nrel_can_teach_subject'];
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
					teacherName,
					sc_type_arc_common | sc_type_const,
					sc_type_node,
					sc_type_arc_pos_const_perm,
					can_teach_addr
				]).
				done(function (identifiers) {
					const dropdown = $("#subject+.dropdown-menu");
					identifiers.forEach((item) => {
						subjectsAddrs.push(item[2]);
						window.scHelper.getIdentifier(item[2], scKeynodes.lang_ru).done(function (content) {
							console.log(content);
							dropdown.append(`<li><a href="#">${content}</a></li>`);
						});
					});

				});
			});
			return subjectsAddrs;
		},
		_findSubjectHours: function (subjectTypeAddr) {
			var nrel_planned_hours, hours = [];
			// Resolve sc-addrs.

			SCWeb.core.Server.resolveScAddr(['nrel_planned_hours'], function (keynodes) {
				nrel_planned_hours = keynodes['nrel_planned_hours'];
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
					subjectTypeAddr,
					sc_type_arc_common | sc_type_const,
					sc_type_node,
					sc_type_arc_pos_const_perm,
					nrel_planned_hours
				]).
				done(function (identifiers) {
					window.scHelper.getSystemIdentifier(identifiers[0][2]).done(function (content) {
						console.log('nrel_planned_hours', content);
						hours.push(Number(content));
					});
				});
			});
			return hours;
		},
		_findTeacherInfo: function (teacherAddr, nrel_what) {
			var nrel_what, what = [];
			// Resolve sc-addrs.

			SCWeb.core.Server.resolveScAddr([nrel_what], function (keynodes) {
				nrel_what = keynodes[nrel_what];
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
					teacherAddr,
					sc_type_arc_common | sc_type_const,
					sc_type_node,
					sc_type_arc_pos_const_perm,
					nrel_what
				]).
				done(function (identifiers) {
					window.scHelper.getSystemIdentifier(identifiers[0][2]).done(function (content) {
						console.log(nrel_what, content);
						what.push(Number(content));
					});
				});
			});
			return what;
		},
		_findCurrentHours: function (teachersAddr, subjectTypeAddr, arcAddrToErase) {
			var nrel_educational_work, nrel_hours_amount, hours = [];
			// Resolve sc-addrs.

			SCWeb.core.Server.resolveScAddr(['nrel_educational_work', 'nrel_hours_amount', 'sc_garbage'], function (keynodes) {
				nrel_educational_work = keynodes['nrel_educational_work'];
				nrel_hours_amount = keynodes['nrel_hours_amount'];
				arcAddrToErase.push(keynodes['sc_garbage']);
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_F_A_F, [
					subjectTypeAddr,
					sc_type_arc_common | sc_type_const,
					teachersAddr,
					sc_type_arc_pos_const_perm,
					nrel_educational_work
				]).
				done(function (identifiers) {
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
						identifiers[0][1],
						sc_type_arc_common | sc_type_const,
						sc_type_node,
						sc_type_arc_pos_const_perm,
						nrel_hours_amount
					]).
					done(function (hoursIdtf) {
						arcAddrToErase.push(hoursIdtf[0][1]);
						window.scHelper.getSystemIdentifier(hoursIdtf[0][2]).done(function (content) {
							console.log('current_hours', content);
							hours.push(Number(content));
							hours.push(hoursIdtf[0][2]);
							hours.push(identifiers[0][1]);
						});
					});
				});
			});
			return hours;
		}
	};

/* --- src/component-drawer.js --- */
/**
 * Example component.
 */
Example.DrawComponent = {
    ext_lang: 'teachers_load',
    formats: ['format_teachers_load_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new Example.DrawWindow(sandbox);
    }
};

Example.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new Example.PaintPanel(this.sandbox.container);
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
SCWeb.core.ComponentManager.appendComponentInitialize(Example.DrawComponent);

