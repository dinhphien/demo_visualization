$(function () {
    $('.js-basic-example').DataTable({
        responsive: true,
        select: {
            style:    'multi',
            selector: 'td:first-child'
        },
        "oLanguage": {
           "sSearch": "Filter"
         }

    });

    //Exportable table
    $('.js-exportable').DataTable({
        dom: 'Bfrtip',
        responsive: true,
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    });
});