/**
 * Paint panel.
 */

CourseProjectsTable.PaintPanel = function (containerId) {
	this.containerId = containerId;
};

CourseProjectsTable.PaintPanel.prototype = {

	init: function () {
		this._initMarkup(this.containerId);
	},

	_initMarkup: function (containerId) {
		var container = $('#' + containerId);

		var self = this;
		$.ajax({
			url: "static/components/html/course_projects_table.html",
			dataType: 'html',
			success: function (response) {
				container.append('<div>' + response + '</div>');
				// new Promise(function (resolve, reject) {
				// 	self._createStudentProjectsTable();
				// 	setTimeout(() => {
				// 		resolve()
				// 	}, 2000);
				// }).then(response => {
				// self._FindStudents();
				// });
				$(document).ready(function () {
					$("#projects_students").click(function () {
						self._createStudentProjectsTable();
						$("#projects_students").toggle("slow");
					});
					$("#students_projects").click(function () {
						self._FindStudents();
						$("#students_projects").toggle("slow");
					});
					$("#table1").click(function () {
						$(".cp-table").toggle("drop");
					});
					$("#table2").click(function () {
						$(".student-table").toggle("drop");
					});
					$("#clickme").click(function () {
						$(".cp-table").toggle("drop");
						// $( ".cp-title" ).toggle( "slow");
						$(".student-table").toggle("drop");
					});
				});
			},
			error: function () {
				console.log("Error to get course projects table");
			}
		});
	},

	/*
	Natural sort for array of objects with "idtf" key
	Usage: array.sort(_naturalSortIdentifiers)
	*/
	_naturalSortIdentifiers: function (a, b) {
		// for debug console.log("IM IN DA FUCKING SORT IDTF")
		var ax = [], bx = [];

		a["idtf"].replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
		b["idtf"].replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

		while (ax.length && bx.length) {
			var an = ax.shift();
			var bn = bx.shift();
			var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
			if (nn) return nn;
		}

		return ax.length - bx.length;
	},

	_createStudentProjectsTable: function () {

		function naturalSortSynonyms(a, b) {
			var ax = [], bx = [];
			a["syn"].replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
			b["syn"].replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

			while (ax.length && bx.length) {
				var an = ax.shift();
				var bn = bx.shift();
				var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
				if (nn) return nn;
			}

			return ax.length - bx.length;
		}

		var project_addr, nrel_main_idtf_addr, nrel_project_leader_addr, nrel_performers_addr, nrel_synonymy_addr;
		var studentProjectsAddrs = [], projects_identifiers = [], projects_with_syn = [];

		SCWeb.core.Server.resolveScAddr(['projects', 'nrel_project_leader', 'nrel_performers', 'nrel_synonymy'], function (keynodes) {
			nrel_synonymy_addr = keynodes['nrel_synonymy'];
			project_addr = keynodes['projects'];
			nrel_project_leader_addr = keynodes['nrel_project_leader'];
			nrel_performers_addr = keynodes['nrel_performers'];
			// for debug console.log('Student project addr ' + project_addr);
			// for debug console.log('Project leader addr ' + nrel_project_leader_addr);
			// for debug console.log('Synonymy addr  ' + nrel_synonymy_addr);
			// for debug console.log('Project performers addr ' + nrel_performers_addr);
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node

			// REPLACE WITH scHelper.getSetElements(project_addr)
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
				project_addr,
				sc_type_arc_pos_const_perm,
				sc_type_node
			]).done(function (identifiers) {
				// for debug
				// console.log(identifiers);
				new Promise(function (resolve, reject) {
					identifiers.forEach((item) => {
						studentProjectsAddrs.push(item[2]);
						window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
							item[2],
							sc_type_arc_common | sc_type_const,
							sc_type_link,
							sc_type_arc_pos_const_perm,
							nrel_synonymy_addr
						]).
							done(function (identifiers) {
								window.sctpClient.get_link_content(identifiers[0][2], 'string').done(function (content) {
									projects_with_syn.push({ 'sc_addr': item[2], 'syn_addr': identifiers[0][2], 'syn': content })
								});
							});

					});
					setTimeout(() => {
						resolve()
					}, 2000);
				}).then(response => {
					projects_with_syn.sort(naturalSortSynonyms);
					console.log(projects_with_syn);
					SCWeb.core.Server.resolveIdentifiers(studentProjectsAddrs, function (idf) {
						// for debug console.log(idf);
						$.each(idf, function (index, value) {
							// adds idtf property to elements in projects array
							projects_with_syn.forEach(function (element) {
								if (element["sc_addr"] == index) {
									element["idtf"] = value;
								}
							}, this);
						});

						projects_with_syn.forEach((item) => {
							// for debug console.log("ADDING TO HTML")
							$(".cp-table").append(`<tr>
								<td class="ps project-${item["sc_addr"]}-syn"><a sc_addr="${item["syn_addr"]}" href="#">${item["syn"]}</a></td>
								<td class="pr project-${item["sc_addr"]}"><a sc_addr="${item["sc_addr"]}" href="#">${item["idtf"]}</a></td>
								<td class="pp project-${item["sc_addr"]}-participants">
									<ul class="participants-list"></ul>
								</td>
								<td class="pm project-${item["sc_addr"]}-manager"></td>
							</tr>`);
							window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
								item["sc_addr"],
								sc_type_arc_common | sc_type_const,
								sc_type_node,
								sc_type_arc_pos_const_perm,
								nrel_project_leader_addr
							]).done(function (project_leaders_addrs) {
								// for debug console.log('Searching for project manager');
								window.scHelper.getIdentifier(project_leaders_addrs[0][2], SCWeb.core.Server._current_language).done(function (idtf) {
									// for debug console.log("IS IT THE FUCKING " + idtf);
									$(`.project-${item["sc_addr"]}-manager`).append(`<a href="#" sc_addr="${project_leaders_addrs[0][2]}">${idtf}</a>`)
								})
							});
							window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
								item["sc_addr"],
								sc_type_arc_common | sc_type_const,
								sc_type_node,
								sc_type_arc_pos_const_perm,
								nrel_performers_addr
							]).done(function (identifiers) {
								identifiers.forEach((participant) => {
									window.scHelper.getIdentifier(participant[2], SCWeb.core.Server._current_language).done(function (name) {
										$(`.project-${item["sc_addr"]}-participants>ul`).append(`<li><a sc_addr="${participant[2]}" href="#">${name}</a></li>`);
									});
								});
							});
						});
					});
				});
			});
		});
	},

	_FindStudents: function () {
		// for debug console.log("inFindStudent");
		var student_project_addr, student_addr, nrel_performers_addr;
		var students_with_projects = [], students = [], student_obj_arr = [];
		// Resolve sc-addrs.
		SCWeb.core.Server.resolveScAddr(['projects', 'student', 'nrel_performers'], function (keynodes) {
			student_project_addr = keynodes['projects'];
			student_addr = keynodes['student'];
			nrel_performers_addr = keynodes['nrel_performers'];
			// for debug console.log('Student addr ' + student_addr);

			new Promise(function (resolve, reject) {
				scHelper.getSetElements(student_addr).done(function (i) { students = i; });
				setTimeout(() => {
					resolve()
				}, 1000);
			}).then(response => {
				students.forEach((student) => {
					// for debug console.log(student);

					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F, [
						sc_type_node,
						sc_type_arc_common | sc_type_const,
						student,
						sc_type_arc_pos_const_perm,
						nrel_performers_addr
					]).
						done(function (projects) {
							// students with projects only i hope
							SCWeb.core.Server.resolveIdentifiers([student], function (idtf) {
								// for debug console.log(idtf);
								$.each(idtf, function (index, value) {
									student_obj_arr.push({ 'sc_addr': index, 'idtf': value });
									$(".student-table").append(`<tr>
									<td class="pp student-${index}"><a sc_addr="${index}" href="#">${value}</a></td>
									<td class="pr student-${index}-projects"><ul class="sp-list"><ul></td>
								</tr>`);
								});
								projects.forEach((project) => {
									SCWeb.core.Server.resolveIdentifiers([project[0]], function (idtf) {
										// for debug console.log(idtf);
										$.each(idtf, function (index, value) {
											$(`.student-${student}-projects>ul`).append(`<li ><a sc_addr="${index}" href="#">${value}</a></li>`);
										});
									});
								})
							});
						})
				});
			});
		})
	}
}