// SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { rest } from 'msw';

export default rest.post(
	'/service/soap/AuthRequest',
	(req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({"Header":{"context":{"change":{"token":32929},"_jsns":"urn:zimbra"}},"Body":{"AuthResponse":{"authToken":[{"_content":"0_bce951abeb9bcbfb4636a421102b961e5dc0a4cd_69643d33363a30393737306236352d643238342d343664392d623062622d3264636537643835306533323b6578703d31333a313631383531373235353730303b76763d313a323b747970653d363a7a696d6272613b753d313a613b7469643d31303a313631353935383832323b76657273696f6e3d31343a382e382e31355f47415f333836393b637372663d313a313b"}],"lifetime":36000000,"prefs":{"_attrs":{"zimbraPrefMailPollingInterval":"120s"}},"skin":[{"_content":"zextras"}],"csrfToken":{"_content":"0_4a4f18e6bf626bdeb86ad966b4579a2995479def"},"_jsns":"urn:zimbraAccount"}},"_jsns":"urn:zimbraSoap"}),
			// ctx.json({"Header":{"context":{"change":{"token":32934},"_jsns":"urn:zimbra"}},"Body":{"Fault":{"Code":{"Value":"soap:Sender"},"Reason":{"Text":"authentication failed for [asd]"},"Detail":{"Error":{"Code":"account.AUTH_FAILED","Trace":"qtp366590980-155736:1618483353424:124048f45be83bed","_jsns":"urn:zimbra"}}}},"_jsns":"urn:zimbraSoap"})
		)
	}
);
