

function Table () {
    return (
        <div className="flex justify-center h-screen bg-gray-100 text-center">
          <div className="bg-white w-full max-w-3xl rounded shadow-md mt-4">
            <div className="bg-blue-900 text-white text-lg font-semibold p-4 rounded-t-md">
              รายชื่อผู้ป่วย
            </div>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ชื่อ-นามสกุล</th>
                  <th className="py-2 px-4 border-b">รหัสนักศึกษา</th>
                  <th className="py-2 px-4 border-b">วันที่และเวลา</th>
                  <th className="py-2 px-4 border-b">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id}>
                    <td className="py-2 px-4 border-b">
                      {ticket.student_name}
                    </td>
                    <td className="py-2 px-4 border-b">{ticket.student_id}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(ticket.datetime).toLocaleString()}
                    </td>
                    <Dialog>
                      <DialogTrigger asChild>
                        <td className="py-2 px-4 border-b text-blue-700 cursor-pointer">
                          ดูรายละเอียด
                        </td>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Patient Information</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-2 py-1">
                          <h3 className="text-3x1 ml-10">
                            Name: {ticket.student_name}
                          </h3>
                          <h3 className="text-3x1 ml-10">
                            Student ID: {ticket.student_id}
                          </h3>
                          <h3 className="text-3x1 ml-10">
                            Check-in Time:{" "}
                            {new Date(ticket.datetime).toLocaleString(
                              "th-TH",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )}
                          </h3>
                          <br></br>
                          <h3 className="text-3x1 ml-10">Patient Symptoms</h3>
                          {ticket.symptom_names ? (
                            <div className="ml-10 space-y-2">
                              {ticket.symptom_names
                                .split(",")
                                .map((symptom, index) => (
                                  <p key={index} className="block">
                                    {symptom.trim()}
                                  </p>
                                ))}
                            </div>
                          ) : (
                            <p className="ml-10">No symptoms recorded</p>
                          )}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Close
                            </Button>
                          </DialogClose>
                          <Button
                            type="submit"
                            onClick={() => handleTicket(ticket)}
                          >
                            สั่งยา
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    )
}