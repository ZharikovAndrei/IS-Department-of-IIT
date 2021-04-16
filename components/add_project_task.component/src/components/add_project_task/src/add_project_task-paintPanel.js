/**
 * Paint panel.
 */

AddProjectTask.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

AddProjectTask.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

        var self = this;

		var projectsAddrs, performersAddrs, taskTypesAddrs, prioritiesAddrs, project, priority, task_type, executor;

		$.ajax({
			url: "static/components/html/add_project_task.html",
			dataType: 'html',
			success: function (response) {
				container.append(response);

				projectsAddrs = self._findProjects();
				prioritiesAddrs = self._findPriorities();

				$("#projects+.dropdown-menu").unbind('click').delegate("a", "click", function (e) {
					const save_button = $("#add_project_task"),
						projects = $("#projects+.dropdown-menu a"),
						project_id = projects.index(e.target);
					// save_button.disabled = true;
					project = projectsAddrs[project_id];
					console.log("project addr is " + project);
					$('#projects')[0].innerText = e.target.innerText;
					performersAddrs = self._findPerformers(project);
				});

				$("#priorities+.dropdown-menu").unbind('click').delegate("a", "click", function (e) {
					const save_button = $("#add_project_task"),
						priorities = $("#priorities+.dropdown-menu a"),
						priority_id = priorities.index(e.target);
					// save_button.disabled = true;
					priority = prioritiesAddrs[priority_id];
					console.log("priority addr is " + priority);
					$('#priorities')[0].innerText = e.target.innerText;
				});

				$("#performers+.dropdown-menu").unbind('click').delegate("a", "click", function (e) {
					const save_button = $("#add_project_task"),
						performers = $("#performers+.dropdown-menu a"),
						executor_id = performers.index(e.target);
						executor = performersAddrs[executor_id];
						console.log("executor addr is " + executor);
						
					// save_button.disabled = true;
					$('#performers')[0].innerText = e.target.innerText;
				});

				taskTypesAddrs = self._findTaskTypes();	

				$("#task_types+.dropdown-menu").unbind('click').delegate("a", "click", function (e) {				
					const save_button = $("#add_project_task"),
						task_types = $("#task_types+.dropdown-menu a"),
						task_type_id = task_types.index(e.target);
					// save_button.disabled = true;
					task_type = taskTypesAddrs[task_type_id];
					console.log("task_type addr is " + task_type);					
					$('#task_types')[0].innerText = e.target.innerText;
				});

				var counter = self._makeCounter();
				
				$('#add_project_task').unbind('click').click(function () {
					self._addProjectTask(project, executor, task_type, priority, counter());
				});
			},
			error: function () {
				console.log("Error to get external html. Your HTML is probably not in sc-web, check it");
			}
		});
	},
	
	_findProjects: function () {
		const projects = [];
		let projects_addr;
		SCWeb.core.Server.resolveScAddr(['projects'], function (keynodes) {
			projects_addr = keynodes['projects'];
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
				projects_addr,
				sc_type_arc_pos_const_perm | sc_type_const,
				sc_type_node
			]).
			done(function (identifiers) {
				const dropdown = $("#projects+.dropdown-menu");
				identifiers.forEach((item) => {
					projects.push(item[2]);
					window.scHelper.getIdentifier(item[2], scKeynodes.lang_ru).done(function (content) {
						dropdown.append(`<li><a href="#">${content}</a></li>`);
					});
				});

			});
		});
		return projects;
	},

	_findPriorities: function () {
		const priorities = [];
		let priorities_addr, subdividing_addr;
		SCWeb.core.Server.resolveScAddr(['project_task_priority', 'nrel_subdividing'], function (keynodes) {
			priorities_addr = keynodes['project_task_priority'];
			subdividing_addr = keynodes['nrel_subdividing'];	
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
				priorities_addr,
				sc_type_arc_common | sc_type_const,
				sc_type_node,
				sc_type_arc_pos_const_perm,
				subdividing_addr
			]).
			done(function (identifiers) {
				const dropdown = $("#priorities+.dropdown-menu");
				identifiers.forEach((item) => {
					priorities.push(item[2]);
					window.scHelper.getIdentifier(item[2], scKeynodes.lang_ru).done(function (content) {
						dropdown.append(`<li><a href="#">${content}</a></li>`);
					});
				});

			});
		});
		return priorities;
	},

	_findTaskTypes: function () {
		const types = [];
		let project_task_addr, subdividing_addr;
		SCWeb.core.Server.resolveScAddr(['project_task', 'nrel_subdividing'], function (keynodes) {
			project_task_addr = keynodes['project_task'];
			subdividing_addr = keynodes['nrel_subdividing'];
			// console.log(project_task_addr, subdividing_addr);
			// console.log('started iterate');
						
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
				project_task_addr,
				sc_type_arc_common | sc_type_const,
				sc_type_node | sc_type_const | sc_type_node_class,
				sc_type_arc_pos_const_perm,
				subdividing_addr
			]).
			done(function (identifiers) {
				// console.log(identifiers);
				const dropdown = $("#task_types+.dropdown-menu");
				identifiers.forEach((item) => {
					// console.log(item);
					types.push(item[2]);
					window.scHelper.getIdentifier(item[2], scKeynodes.lang_ru).done(function (content) {
						dropdown.append(`<li><a href="#">${content}</a></li>`);
					});
				});
				// console.log('done with done');	
			});
		});
		return types;
	},

	_findPerformers: function (project) {
		$("#performers+.dropdown-menu li").empty();
		const performers = [];
		let performers_addr;
		SCWeb.core.Server.resolveScAddr(['nrel_performers'], function (keynodes) {
			performers_addr = keynodes['nrel_performers'];
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
				project,
				sc_type_arc_common | sc_type_const,
				sc_type_node,
				sc_type_arc_pos_const_perm,
				performers_addr
			]).
			done(function (identifiers) {
				const dropdown = $("#performers+.dropdown-menu");
				identifiers.forEach((item) => {
					performers.push(item[2]);
					window.scHelper.getIdentifier(item[2], scKeynodes.lang_ru).done(function (content) {
						dropdown.append(`<li><a href="#">${content}</a></li>`);
					});
				});

			});
		});
		return performers;
	},

	_makeCounter() {
		var currentCount = 1;
	  
		return function() { // (**)
		  return currentCount++;
		};
	  },

	_addProjectTask(project, executor, taskType, priority, counter) {
		var project_task_addr, description_addr, nrel_executor_addr, nrel_priority_addr;
		SCWeb.core.Server.resolveScAddr(['project_task', 'nrel_description', 'nrel_executor', 'nrel_priority'], function (keynodes) {
			project_task_addr = keynodes['project_task'];
			description_addr = keynodes['nrel_description']; 
			nrel_executor_addr = keynodes['nrel_executor'];
			nrel_priority_addr = keynodes['nrel_priority'];
			window.scHelper.getSystemIdentifier(project).done(function (content) {
				// console.log("found this bitch " + content);
				task_system_idtf = content + '_task_' + executor + '_' + Math.floor((Math.random() * 100) + 1);
			});
			
			
			new Promise(function (resolve) {
                window.sctpClient.create_node(sc_type_node).done(function (generatedNode) {
                    window.sctpClient.create_link().done(function (generatedLink) {
                        window.sctpClient.set_link_content(generatedLink, task_system_idtf);
                        window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, generatedNode, generatedLink).done(function (generatedCommonArc) {
                            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_system_identifier, generatedCommonArc).done(function () {
                                console.log('generated ', generatedNode, task_system_idtf);
                                resolve(generatedNode);
                            });
                        });
                    });
                });
            }).then((response) => {
				// добавить название (идтф)
				window.sctpClient.create_link().done(function (generatedTitleLink) {
					window.sctpClient.set_link_content(generatedTitleLink, '#'+counter+' '+$("#task_title").val());
					window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, response, generatedTitleLink).done(function (generatedCommonArc) {
						window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_main_idtf, generatedCommonArc);
					});
					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.lang_ru, generatedTitleLink)
				});
				// добавить описание
				window.sctpClient.create_link().done(function (generatedDescriptionLink) {
					window.sctpClient.set_link_content(generatedDescriptionLink, $("#task_description").val());
					window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, response, generatedDescriptionLink).done(function (generatedCommonArc) {
						window.sctpClient.create_arc(sc_type_arc_pos_const_perm, description_addr, generatedCommonArc);
					});
					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.lang_ru, generatedDescriptionLink)
				});
				// прикрепить тип
				window.sctpClient.create_arc(sc_type_arc_pos_const_perm, taskType, response);
				// прикрепить к множеству задач
				window.sctpClient.create_arc(sc_type_arc_pos_const_perm, project_task_addr, response);
				// прикрепить исполнителя 
				window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, executor, response).done(function (generatedCommonArc) {
					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_executor_addr, generatedCommonArc);
				});
				// priority
				window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, response, priority).done(function (generatedCommonArc) {
					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_priority_addr, generatedCommonArc).done(function (new_arc) {
						toastr.success('Сохранено');
					});
				});
			});	
		});
	},
};
